import { type ReadmeGeneration, type InsertReadmeGeneration, type User, type InsertUser, users, readmeGenerations } from "@shared/schema";
import { randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc } from "drizzle-orm";

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

export interface IStorage {
  // User management
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByGithubId(githubId: string): Promise<User | undefined>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // README generation management
  createReadmeGeneration(generation: InsertReadmeGeneration): Promise<ReadmeGeneration>;
  getReadmeGeneration(id: string): Promise<ReadmeGeneration | undefined>;
  getRecentGenerations(limit?: number, userId?: string): Promise<ReadmeGeneration[]>;
}

export class DatabaseStorage implements IStorage {
  // User management methods
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByGithubId(githubId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.githubId, githubId)).limit(1);
    return result[0];
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // README generation methods
  async createReadmeGeneration(insertGeneration: InsertReadmeGeneration): Promise<ReadmeGeneration> {
    const [generation] = await db.insert(readmeGenerations).values(insertGeneration).returning();
    return generation;
  }

  async getReadmeGeneration(id: string): Promise<ReadmeGeneration | undefined> {
    const result = await db.select().from(readmeGenerations).where(eq(readmeGenerations.id, id)).limit(1);
    return result[0];
  }

  async getRecentGenerations(limit: number = 10, userId?: string): Promise<ReadmeGeneration[]> {
    if (userId) {
      return await db
        .select()
        .from(readmeGenerations)
        .where(eq(readmeGenerations.userId, userId))
        .orderBy(desc(readmeGenerations.createdAt))
        .limit(limit);
    }
    
    return await db
      .select()
      .from(readmeGenerations)
      .orderBy(desc(readmeGenerations.createdAt))
      .limit(limit);
  }
}

// Fallback memory storage for development
export class MemStorage implements IStorage {
  private generations: Map<string, ReadmeGeneration>;
  private usersMap: Map<string, User>;
  private usersByGithubId: Map<string, User>;

  constructor() {
    this.generations = new Map();
    this.usersMap = new Map();
    this.usersByGithubId = new Map();
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
    this.usersMap.set(id, user);
    this.usersByGithubId.set(insertUser.githubId, user);
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByGithubId(githubId: string): Promise<User | undefined> {
    return this.usersByGithubId.get(githubId);
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.usersMap.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.usersMap.set(id, updatedUser);
    if (updates.githubId) {
      this.usersByGithubId.delete(user.githubId);
      this.usersByGithubId.set(updates.githubId, updatedUser);
    }
    return updatedUser;
  }

  async createReadmeGeneration(insertGeneration: InsertReadmeGeneration): Promise<ReadmeGeneration> {
    const id = randomUUID();
    const generation: ReadmeGeneration = {
      ...insertGeneration,
      id,
      createdAt: new Date(),
    } as ReadmeGeneration;
    this.generations.set(id, generation);
    return generation;
  }

  async getReadmeGeneration(id: string): Promise<ReadmeGeneration | undefined> {
    return this.generations.get(id);
  }

  async getRecentGenerations(limit: number = 10, userId?: string): Promise<ReadmeGeneration[]> {
    const allGenerations = Array.from(this.generations.values());
    let filtered = allGenerations;
    
    if (userId) {
      filtered = allGenerations.filter(g => g.userId === userId);
    }
    
    return filtered
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

// Use database storage if available, fallback to memory storage
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
