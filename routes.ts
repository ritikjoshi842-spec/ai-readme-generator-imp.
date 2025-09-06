import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ReadmeGeneratorService } from "./services/readme-generator";
import { AuthService } from "./services/auth";
import { 
  generateReadmeRequestSchema, 
  generationSettingsSchema,
  type GenerateReadmeRequest,
  type GenerateReadmeResponse 
} from "@shared/schema";
import { z } from "zod";
import { randomBytes } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  const readmeGenerator = new ReadmeGeneratorService();
  const authService = new AuthService();

  // Authentication middleware to get user from session
  const getUser = async (req: any) => {
    if (req.session?.userId) {
      return await authService.getUserById(req.session.userId);
    }
    return null;
  };

  // Authentication routes
  app.get("/auth/github", async (req, res) => {
    const state = randomBytes(16).toString('hex');
    req.session.oauthState = state;
    
    const authUrl = authService.getAuthUrl(state);
    res.redirect(authUrl);
  });

  app.get("/auth/github/callback", async (req, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code || !state || state !== req.session.oauthState) {
        return res.status(400).json({ error: "Invalid OAuth callback" });
      }
      
      delete req.session.oauthState;
      
      const accessToken = await authService.exchangeCodeForToken(code as string);
      const githubUser = await authService.getGitHubUser(accessToken);
      const user = await authService.findOrCreateUser(githubUser, accessToken);
      
      req.session.userId = user.id;
      
      res.redirect("/?auth=success");
    } catch (error: any) {
      console.error("OAuth callback error:", error.message || "Authentication failed");
      res.redirect("/?auth=error");
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/user", async (req, res) => {
    const user = await getUser(req);
    if (user) {
      // Don't send access token to frontend for security
      const { githubAccessToken, ...safeUser } = user;
      res.json(safeUser);
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  // Generate README endpoint
  app.post("/api/generate-readme", async (req, res) => {
    try {
      const body = generateReadmeRequestSchema.parse(req.body);
      const { repositoryUrl, settings = generationSettingsSchema.parse({}) } = body;
      const user = await getUser(req);

      // Validate user token if provided
      if (user?.githubAccessToken) {
        const isValidToken = await authService.validateAccessToken(user.githubAccessToken);
        if (!isValidToken) {
          // Clear invalid session
          req.session.destroy(() => {});
          return res.status(401).json({
            success: false,
            error: "Your GitHub authentication has expired. Please sign in again to access private repositories.",
          });
        }
      }

      const result = await readmeGenerator.generateReadme(
        repositoryUrl,
        settings,
        user?.githubAccessToken // Pass user's token for private repos
      );

      // Store the generation
      const generation = await storage.createReadmeGeneration({
        userId: user?.id || null,
        repositoryUrl,
        repositoryName: result.repositoryData.name,
        repositoryOwner: result.repositoryData.full_name.split('/')[0],
        markdownContent: result.markdownContent,
        repositoryData: result.repositoryData,
        generationSettings: settings,
        isPrivateRepo: result.repositoryData.private || false,
      });

      const response: GenerateReadmeResponse = {
        success: true,
        data: {
          id: generation.id,
          markdownContent: result.markdownContent,
          repositoryData: result.repositoryData,
          processingSteps: result.processingSteps,
        },
      };

      res.json(response);
    } catch (error: any) {
      console.error("README generation error:", error.message || "Generation failed");
      
      // Check if it's an authentication error
      if (error.status === 401 || error.status === 403) {
        return res.status(401).json({
          success: false,
          error: "Repository access denied. Please sign in with GitHub to access private repositories, or check if the repository exists and is public.",
        });
      }
      
      const response: GenerateReadmeResponse = {
        success: false,
        error: error.message || "Failed to generate README",
      };

      res.status(400).json(response);
    }
  });

  // Get README generation by ID
  app.get("/api/readme/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const generation = await storage.getReadmeGeneration(id);

      if (!generation) {
        return res.status(404).json({ error: "README generation not found" });
      }

      res.json(generation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get recent generations (user-specific if authenticated)
  app.get("/api/recent-generations", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const user = await getUser(req);
      const generations = await storage.getRecentGenerations(limit, user?.id);
      res.json(generations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Download README as file
  app.get("/api/download/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const generation = await storage.getReadmeGeneration(id);

      if (!generation) {
        return res.status(404).json({ error: "README generation not found" });
      }

      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="${generation.repositoryName}-README.md"`);
      res.send(generation.markdownContent);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Validate repository URL endpoint
  app.post("/api/validate-repository", async (req, res) => {
    try {
      const { repositoryUrl } = z.object({ 
        repositoryUrl: z.string().url() 
      }).parse(req.body);

      // Basic URL validation
      if (!repositoryUrl.includes('github.com')) {
        return res.status(400).json({ 
          valid: false, 
          error: "Please provide a valid GitHub repository URL" 
        });
      }

      const urlPattern = /github\.com\/([^\/]+)\/([^\/]+)(?:\/|$)/;
      const match = repositoryUrl.match(urlPattern);
      
      if (!match) {
        return res.status(400).json({ 
          valid: false, 
          error: "Invalid GitHub URL format. Expected: https://github.com/username/repository" 
        });
      }

      res.json({ valid: true });
    } catch (error: any) {
      res.status(400).json({ 
        valid: false, 
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
