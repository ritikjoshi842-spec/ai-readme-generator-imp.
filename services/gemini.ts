import { GoogleGenAI } from "@google/genai";
import { GitHubRepository, GenerationSettings } from "@shared/schema";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateDescription(
    repository: GitHubRepository,
    projectStructure: any,
    settings: GenerationSettings
  ): Promise<string> {
    const prompt = `Generate a ${settings.style} description for a GitHub repository with the following details:

Repository: ${repository.name}
Current Description: ${repository.description || "No description provided"}
Language: ${repository.language || "Not specified"}
Topics: ${repository.topics.join(", ") || "None"}
Technologies: ${projectStructure.technologies.join(", ") || "None"}
Framework: ${projectStructure.framework || "None"}

Style: ${settings.style}
Length: ${settings.length}

Please create a clear, engaging description that explains what this project does, its main purpose, and key benefits. Make it professional and informative.`;

    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "";
  }

  async generateFeatures(
    repository: GitHubRepository,
    projectStructure: any,
    settings: GenerationSettings
  ): Promise<string[]> {
    const systemPrompt = `You are an expert technical writer. Generate a list of key features for a software project.
Respond with a JSON array of strings, each representing a feature.
Make features specific, technical, and valuable to users.
Limit to 5-8 key features.`;

    const prompt = `Generate key features for this repository:

Repository: ${repository.name}
Description: ${repository.description || "No description"}
Language: ${repository.language || "Not specified"}
Technologies: ${projectStructure.technologies.join(", ") || "None"}
Framework: ${projectStructure.framework || "None"}
Has Tests: ${projectStructure.hasTests}
Has Documentation: ${projectStructure.hasDocumentation}

Style: ${settings.style}`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "array",
            items: { type: "string" },
          },
        },
        contents: prompt,
      });

      const rawJson = response.text;
      if (rawJson) {
        return JSON.parse(rawJson);
      }
    } catch (error) {
      console.warn("Failed to generate structured features, falling back to text parsing");
    }

    // Fallback to text-based generation
    const fallbackResponse = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${prompt}\n\nReturn as a simple list with each feature on a new line, starting with "- "`,
    });

    const text = fallbackResponse.text || "";
    return text
      .split("\n")
      .filter(line => line.trim().startsWith("- "))
      .map(line => line.replace(/^- /, "").trim())
      .slice(0, 8);
  }

  async generateInstallationInstructions(
    repository: GitHubRepository,
    projectStructure: any,
    packageJson: any
  ): Promise<string> {
    const prompt = `Generate installation instructions for this repository:

Repository: ${repository.name}
Language: ${repository.language}
Build System: ${projectStructure.buildSystem}
Framework: ${projectStructure.framework}
Technologies: ${projectStructure.technologies.join(", ")}
Package JSON exists: ${!!packageJson}

Generate clear, step-by-step installation instructions. Include:
1. Prerequisites (if any)
2. Clone command
3. Install dependencies command
4. Any setup/configuration steps
5. How to run the project

Make instructions beginner-friendly but concise.`;

    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "";
  }

  async generateUsageExamples(
    repository: GitHubRepository,
    projectStructure: any,
    packageJson: any,
    existingReadme: string | null
  ): Promise<string> {
    const prompt = `Generate usage examples for this repository:

Repository: ${repository.name}
Description: ${repository.description || "No description"}
Language: ${repository.language}
Framework: ${projectStructure.framework}
Technologies: ${projectStructure.technologies.join(", ")}
Package JSON scripts: ${packageJson?.scripts ? Object.keys(packageJson.scripts).join(", ") : "None"}
Existing README content (for reference): ${existingReadme?.substring(0, 1000) || "None"}

Generate practical usage examples including:
1. Basic usage/getting started
2. Code examples (if it's a library/framework)
3. Available commands/scripts
4. Configuration options (if applicable)

Make examples clear and immediately actionable.`;

    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "";
  }

  async generateApiDocumentation(
    repository: GitHubRepository,
    projectStructure: any,
    existingReadme: string | null
  ): Promise<string> {
    if (!existingReadme || projectStructure.technologies.length === 0) {
      return "API documentation not available or not applicable for this project.";
    }

    const prompt = `Generate API documentation section for this repository:

Repository: ${repository.name}
Technologies: ${projectStructure.technologies.join(", ")}
Framework: ${projectStructure.framework}
Existing README (for reference): ${existingReadme.substring(0, 2000)}

If this is a library, API, or framework, generate:
1. Main API endpoints or methods
2. Parameters and return values
3. Example requests/responses
4. Authentication (if applicable)

If not an API project, generate relevant interface documentation instead.`;

    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "";
  }

  async generateContributingGuidelines(
    repository: GitHubRepository,
    projectStructure: any,
    settings: GenerationSettings
  ): Promise<string> {
    const prompt = `Generate contributing guidelines for this repository:

Repository: ${repository.name}
Language: ${repository.language}
Has Tests: ${projectStructure.hasTests}
Technologies: ${projectStructure.technologies.join(", ")}
Build System: ${projectStructure.buildSystem}
Style: ${settings.style}

Generate contributing guidelines that include:
1. How to report issues
2. How to submit pull requests
3. Development setup
4. Coding standards
5. Testing requirements (if tests exist)
6. Review process

Keep it welcoming but clear about expectations.`;

    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "";
  }
}
