import { Octokit } from "@octokit/rest";
import { insertUserSchema, User } from "@shared/schema";
import { storage } from "../storage";

interface GitHubOAuthUser {
  id: number;
  login: string;
  avatar_url: string;
  email?: string;
}

export class AuthService {
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.clientId = process.env.GITHUB_CLIENT_ID!;
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET!;
  }

  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: `${process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'http://localhost:5000'}/auth/github/callback`,
      scope: 'repo,user:email',
      state,
    });
    
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<string> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OAuth error: ${data.error_description}`);
    }
    
    return data.access_token;
  }

  async getGitHubUser(accessToken: string): Promise<GitHubOAuthUser> {
    const octokit = new Octokit({ auth: accessToken });
    
    // Get user info
    const { data: user } = await octokit.rest.users.getAuthenticated();
    
    // Get primary email if not public
    let email = user.email;
    if (!email) {
      try {
        const { data: emails } = await octokit.rest.users.listEmailsForAuthenticatedUser();
        const primaryEmail = emails.find(e => e.primary);
        email = primaryEmail?.email || null;
      } catch (error) {
        // Email scope might not be granted
        console.warn('Could not fetch user email: Email scope not granted');
      }
    }

    return {
      id: user.id,
      login: user.login,
      avatar_url: user.avatar_url,
      email: email ?? undefined,
    };
  }

  async findOrCreateUser(githubUser: GitHubOAuthUser, accessToken: string): Promise<User> {
    // Try to find existing user
    const existingUser = await storage.getUserByGithubId(githubUser.id.toString());

    if (existingUser) {
      // Update access token (it might be refreshed)
      const updatedUser = await storage.updateUser(existingUser.id, {
        githubAccessToken: accessToken,
        avatarUrl: githubUser.avatar_url,
        email: githubUser.email || null,
      });
      
      return updatedUser!;
    }

    // Create new user
    const newUserData = insertUserSchema.parse({
      githubId: githubUser.id.toString(),
      githubUsername: githubUser.login,
      githubAccessToken: accessToken,
      avatarUrl: githubUser.avatar_url,
      email: githubUser.email || null,
    });

    const newUser = await storage.createUser(newUserData);
    return newUser;
  }

  async getUserById(userId: string): Promise<User | null> {
    const user = await storage.getUserById(userId);
    return user || null;
  }

  async validateAccessToken(accessToken: string): Promise<boolean> {
    try {
      const octokit = new Octokit({ auth: accessToken });
      await octokit.rest.users.getAuthenticated();
      return true;
    } catch (error) {
      return false;
    }
  }
}