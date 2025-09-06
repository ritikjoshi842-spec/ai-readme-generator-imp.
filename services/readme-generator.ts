import { GitHubService } from "./github";
import { GeminiService } from "./gemini";
import { GitHubRepository, GenerationSettings } from "@shared/schema";

export interface ProcessingStep {
  step: string;
  status: "pending" | "processing" | "completed" | "failed";
  message?: string;
}

export class ReadmeGeneratorService {
  private geminiService: GeminiService;

  constructor() {
    this.geminiService = new GeminiService();
  }

  async generateReadme(
    repositoryUrl: string,
    settings: GenerationSettings,
    userAccessToken?: string,
    onProgress?: (steps: ProcessingStep[]) => void
  ): Promise<{ markdownContent: string; repositoryData: GitHubRepository; processingSteps: ProcessingStep[] }> {
    const steps: ProcessingStep[] = [
      { step: "Fetching repository metadata", status: "pending" },
      { step: "Analyzing project structure", status: "pending" },
      { step: "Generating content with AI", status: "pending" },
      { step: "Formatting Markdown output", status: "pending" },
    ];

    const updateStep = (index: number, status: ProcessingStep["status"], message?: string) => {
      steps[index] = { ...steps[index], status, message };
      onProgress?.(steps);
    };

    try {
      // Use authenticated GitHub service if user token is provided
      const githubService = userAccessToken 
        ? GitHubService.withUserToken(userAccessToken)
        : new GitHubService();

      // Step 1: Fetch repository metadata
      updateStep(0, "processing");
      const repositoryData = await githubService.getRepository(repositoryUrl);
      updateStep(0, "completed");

      // Step 2: Analyze project structure
      updateStep(1, "processing");
      const projectStructure = await githubService.analyzeProjectStructure(repositoryUrl);
      const packageJson = await githubService.getPackageJson(repositoryUrl);
      const existingReadme = await githubService.getReadmeFile(repositoryUrl);
      updateStep(1, "completed");

      // Step 3: Generate content with AI
      updateStep(2, "processing");
      const [description, features, installation, usage, contributing, apiDocs] = await Promise.all([
        this.geminiService.generateDescription(repositoryData, projectStructure, settings),
        this.geminiService.generateFeatures(repositoryData, projectStructure, settings),
        settings.includeSections.installation
          ? this.geminiService.generateInstallationInstructions(repositoryData, projectStructure, packageJson)
          : Promise.resolve(""),
        settings.includeSections.usage
          ? this.geminiService.generateUsageExamples(repositoryData, projectStructure, packageJson, existingReadme)
          : Promise.resolve(""),
        settings.includeSections.contributing
          ? this.geminiService.generateContributingGuidelines(repositoryData, projectStructure, settings)
          : Promise.resolve(""),
        settings.includeSections.api
          ? this.geminiService.generateApiDocumentation(repositoryData, projectStructure, existingReadme)
          : Promise.resolve(""),
      ]);
      updateStep(2, "completed");

      // Step 4: Format Markdown output
      updateStep(3, "processing");
      const markdownContent = this.formatMarkdown({
        repository: repositoryData,
        projectStructure,
        description,
        features,
        installation,
        usage,
        contributing,
        apiDocs,
        settings,
      });
      updateStep(3, "completed");

      return { markdownContent, repositoryData, processingSteps: steps };
    } catch (error: any) {
      const failedStepIndex = steps.findIndex(step => step.status === "processing");
      if (failedStepIndex !== -1) {
        updateStep(failedStepIndex, "failed", error.message);
      }
      throw error;
    }
  }

  private formatMarkdown(data: {
    repository: GitHubRepository;
    projectStructure: any;
    description: string;
    features: string[];
    installation: string;
    usage: string;
    contributing: string;
    apiDocs: string;
    settings: GenerationSettings;
  }): string {
    const { repository, projectStructure, description, features, installation, usage, contributing, apiDocs, settings } = data;

    let markdown = "";

    // Title
    markdown += `# ${repository.name}\n\n`;

    // Badges
    if (settings.includeBadges.build || settings.includeBadges.version || settings.includeBadges.downloads) {
      const badges = [];
      
      if (settings.includeBadges.build) {
        badges.push(`![Build Status](https://img.shields.io/github/actions/workflow/status/${repository.full_name}/ci.yml)`);
      }
      
      if (settings.includeBadges.version) {
        badges.push(`![Version](https://img.shields.io/github/v/release/${repository.full_name})`);
      }
      
      if (repository.license && settings.includeBadges.build) {
        badges.push(`![License](https://img.shields.io/badge/license-${repository.license.spdx_id}-blue)`);
      }
      
      badges.push(`![Stars](https://img.shields.io/github/stars/${repository.full_name})`);
      badges.push(`![Forks](https://img.shields.io/github/forks/${repository.full_name})`);

      if (badges.length > 0) {
        markdown += badges.join(" ") + "\n\n";
      }
    }

    // Description
    markdown += `## Description\n\n${description}\n\n`;

    // Features
    if (features.length > 0) {
      markdown += "## Features\n\n";
      features.forEach(feature => {
        markdown += `- ${feature}\n`;
      });
      markdown += "\n";
    }

    // Tech Stack
    if (projectStructure.technologies.length > 0 || repository.language) {
      markdown += "## Tech Stack\n\n";
      
      if (repository.language) {
        markdown += `**Language:** ${repository.language}\n\n`;
      }
      
      if (projectStructure.framework) {
        markdown += `**Framework:** ${projectStructure.framework}\n\n`;
      }
      
      if (projectStructure.technologies.length > 0) {
        markdown += "**Technologies:** " + projectStructure.technologies.join(", ") + "\n\n";
      }
      
      if (projectStructure.buildSystem) {
        markdown += `**Build System:** ${projectStructure.buildSystem}\n\n`;
      }
    }

    // Installation
    if (settings.includeSections.installation && installation) {
      markdown += "## Installation\n\n" + installation + "\n\n";
    }

    // Usage
    if (settings.includeSections.usage && usage) {
      markdown += "## Usage\n\n" + usage + "\n\n";
    }

    // API Documentation
    if (settings.includeSections.api && apiDocs && apiDocs !== "API documentation not available or not applicable for this project.") {
      markdown += "## API Documentation\n\n" + apiDocs + "\n\n";
    }

    // Project Structure
    markdown += "## Project Structure\n\n";
    markdown += "```\n";
    markdown += `${repository.name}/\n`;
    markdown += "├── src/                 # Source code\n";
    markdown += "├── docs/                # Documentation\n";
    if (projectStructure.hasTests) {
      markdown += "├── tests/               # Test files\n";
    }
    if (projectStructure.buildSystem === "npm") {
      markdown += "├── package.json         # Project dependencies\n";
    }
    markdown += "└── README.md            # Project documentation\n";
    markdown += "```\n\n";

    // Contributing
    if (settings.includeSections.contributing && contributing) {
      markdown += "## Contributing\n\n" + contributing + "\n\n";
    }

    // License
    if (repository.license) {
      markdown += `## License\n\nThis project is licensed under the ${repository.license.name} License. See the LICENSE file for details.\n\n`;
    }

    // Repository Info
    markdown += "## Repository Information\n\n";
    markdown += `- **Repository:** [${repository.full_name}](https://github.com/${repository.full_name})\n`;
    markdown += `- **Stars:** ${repository.stargazers_count}\n`;
    markdown += `- **Forks:** ${repository.forks_count}\n`;
    if (repository.homepage) {
      markdown += `- **Homepage:** [${repository.homepage}](${repository.homepage})\n`;
    }
    markdown += "\n";

    return markdown;
  }
}
