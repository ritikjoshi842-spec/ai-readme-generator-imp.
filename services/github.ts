import { Octokit } from "@octokit/rest";
import { GitHubRepository, githubRepositorySchema } from "@shared/schema";

export class GitHubService {
  private octokit: Octokit;

  constructor(accessToken?: string) {
    this.octokit = new Octokit({
      auth: accessToken || process.env.GITHUB_TOKEN || process.env.GITHUB_API_KEY,
    });
  }

  // Create a new instance with user's access token
  static withUserToken(accessToken: string): GitHubService {
    return new GitHubService(accessToken);
  }

  parseRepositoryUrl(url: string): { owner: string; repo: string } {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/|$)/);
    if (!match) {
      throw new Error("Invalid GitHub repository URL format");
    }
    return { owner: match[1], repo: match[2] };
  }

  async getRepository(url: string): Promise<GitHubRepository> {
    try {
      const { owner, repo } = this.parseRepositoryUrl(url);
      
      const response = await this.octokit.rest.repos.get({
        owner,
        repo,
      });

      const repositoryData = githubRepositorySchema.parse(response.data);
      return repositoryData;
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error("Repository not found. Please check the URL and ensure the repository is public.");
      }
      if (error.status === 403) {
        throw new Error("Access denied. The repository may be private or you may have exceeded API rate limits.");
      }
      throw new Error(`Failed to fetch repository: ${error.message}`);
    }
  }

  async getRepositoryContents(url: string, path: string = ""): Promise<any[]> {
    try {
      const { owner, repo } = this.parseRepositoryUrl(url);
      
      const response = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });

      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error: any) {
      console.warn(`Failed to fetch repository contents for path ${path}:`, error.message);
      return [];
    }
  }

  async getPackageJson(url: string): Promise<any | null> {
    try {
      const { owner, repo } = this.parseRepositoryUrl(url);
      
      const response = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path: "package.json",
      });

      if ("content" in response.data) {
        const content = Buffer.from(response.data.content, "base64").toString();
        return JSON.parse(content);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async getReadmeFile(url: string): Promise<string | null> {
    try {
      const { owner, repo } = this.parseRepositoryUrl(url);
      
      const readmeFiles = ["README.md", "readme.md", "README.rst", "README.txt", "README"];
      
      for (const filename of readmeFiles) {
        try {
          const response = await this.octokit.rest.repos.getContent({
            owner,
            repo,
            path: filename,
          });

          if ("content" in response.data) {
            return Buffer.from(response.data.content, "base64").toString();
          }
        } catch (error) {
          continue;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async analyzeProjectStructure(url: string): Promise<{
    hasTests: boolean;
    hasDocumentation: boolean;
    buildSystem: string | null;
    framework: string | null;
    technologies: string[];
  }> {
    try {
      const contents = await this.getRepositoryContents(url);
      const packageJson = await this.getPackageJson(url);
      
      const fileNames = contents.map((item: any) => item.name.toLowerCase());
      const technologies = new Set<string>();
      
      // Detect build systems
      let buildSystem = null;
      if (fileNames.includes("package.json")) buildSystem = "npm";
      if (fileNames.includes("yarn.lock")) buildSystem = "yarn";
      if (fileNames.includes("pom.xml")) buildSystem = "maven";
      if (fileNames.includes("build.gradle")) buildSystem = "gradle";
      if (fileNames.includes("makefile")) buildSystem = "make";
      if (fileNames.includes("dockerfile")) technologies.add("Docker");

      // Detect framework/technologies
      let framework = null;
      if (packageJson) {
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        if (deps.react) { framework = "React"; technologies.add("React"); }
        if (deps.vue) { framework = "Vue.js"; technologies.add("Vue.js"); }
        if (deps.angular || deps["@angular/core"]) { framework = "Angular"; technologies.add("Angular"); }
        if (deps.next) { framework = "Next.js"; technologies.add("Next.js"); }
        if (deps.express) technologies.add("Express.js");
        if (deps.typescript) technologies.add("TypeScript");
        if (deps.tailwindcss) technologies.add("Tailwind CSS");
        if (deps.jest) technologies.add("Jest");
        if (deps.eslint) technologies.add("ESLint");
        if (deps.prettier) technologies.add("Prettier");
      }

      // Detect common files/folders
      const hasTests = fileNames.some(name => 
        name.includes("test") || 
        name.includes("spec") || 
        name === "__tests__" ||
        name === "tests"
      );

      const hasDocumentation = fileNames.some(name => 
        name.includes("doc") || 
        name === "docs" ||
        name.includes("wiki")
      );

      // Detect by file extensions
      const extensions = contents
        .filter((item: any) => item.type === "file")
        .map((item: any) => item.name.split(".").pop()?.toLowerCase())
        .filter(Boolean);

      if (extensions.includes("py")) technologies.add("Python");
      if (extensions.includes("java")) technologies.add("Java");
      if (extensions.includes("cpp") || extensions.includes("cc")) technologies.add("C++");
      if (extensions.includes("c")) technologies.add("C");
      if (extensions.includes("rs")) technologies.add("Rust");
      if (extensions.includes("go")) technologies.add("Go");
      if (extensions.includes("php")) technologies.add("PHP");
      if (extensions.includes("rb")) technologies.add("Ruby");

      return {
        hasTests,
        hasDocumentation,
        buildSystem,
        framework,
        technologies: Array.from(technologies),
      };
    } catch (error) {
      console.warn("Failed to analyze project structure:", error);
      return {
        hasTests: false,
        hasDocumentation: false,
        buildSystem: null,
        framework: null,
        technologies: [],
      };
    }
  }
}
