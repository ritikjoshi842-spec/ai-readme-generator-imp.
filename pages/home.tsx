import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { UrlInput } from "@/components/url-input";
import { ProcessingStatus } from "@/components/processing-status";
import { ReadmePreview } from "@/components/readme-preview";
import { SettingsPanel } from "@/components/settings-panel";
import { FeaturesGrid } from "@/components/features-grid";
import { Footer } from "@/components/footer";
import { PrivateRepoNotice } from "@/components/private-repo-notice";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { GenerationSettings, GenerateReadmeResponse, ReadmeGeneration } from "@shared/schema";
import type { ProcessingStep } from "../../../server/services/readme-generator";

export default function Home() {
  const [generationResult, setGenerationResult] = useState<GenerateReadmeResponse | null>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [settings, setSettings] = useState<GenerationSettings>({
    style: "professional",
    length: "comprehensive",
    includeSections: {
      installation: true,
      usage: true,
      contributing: true,
      api: false,
    },
    includeBadges: {
      build: true,
      version: true,
      downloads: false,
    },
    template: "default",
  });

  const { toast } = useToast();

  // Handle authentication callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    
    if (authStatus === 'success') {
      toast({
        title: "Authentication successful! 🎉",
        description: "You can now access your private repositories.",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (authStatus === 'error') {
      toast({
        title: "Authentication failed",
        description: "There was an error signing you in. Please try again.",
        variant: "destructive",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  // Fetch recent generations
  const { data: recentGenerations = [] } = useQuery({
    queryKey: ["/api/recent-generations"],
    queryFn: () => api.getRecentGenerations(6),
  });

  const generateMutation = useMutation({
    mutationFn: ({ repositoryUrl, settings }: { repositoryUrl: string; settings: GenerationSettings }) =>
      api.generateReadme({ repositoryUrl, settings }),
    onMutate: () => {
      setIsGenerating(true);
      setGenerationResult(null);
      setProcessingSteps([
        { step: "Fetching repository metadata", status: "pending" },
        { step: "Analyzing project structure", status: "pending" },
        { step: "Generating content with AI", status: "pending" },
        { step: "Formatting Markdown output", status: "pending" },
      ]);
    },
    onSuccess: (result) => {
      setGenerationResult(result);
      if (result.success && result.data) {
        setProcessingSteps(result.data.processingSteps);
        toast({
          title: "Awesome! ✨ README is Ready!",
          description: "Your README looks amazing and is ready for download! 🎉",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate README",
        variant: "destructive",
      });
      setProcessingSteps(current => 
        current.map((step, index) => 
          step.status === "processing" 
            ? { ...step, status: "failed" as const, message: error.message }
            : step
        )
      );
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  const handleGenerate = (repositoryUrl: string, generationSettings: GenerationSettings) => {
    generateMutation.mutate({ repositoryUrl, settings: generationSettings });
  };

  const viewRecentGeneration = (generation: ReadmeGeneration) => {
    const mockResult: GenerateReadmeResponse = {
      success: true,
      data: {
        id: generation.id,
        markdownContent: generation.markdownContent,
        repositoryData: generation.repositoryData,
        processingSteps: [
          { step: "Fetching repository metadata", status: "completed" },
          { step: "Analyzing project structure", status: "completed" },
          { step: "Generating content with AI", status: "completed" },
          { step: "Formatting Markdown output", status: "completed" },
        ],
      },
    };
    setGenerationResult(mockResult);
    setProcessingSteps(mockResult.data!.processingSteps);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            <span className="gradient-text">BYTE Project 1:</span> 
            AI README Generator
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Hey there! This is my BYTE project that uses AI to automatically create awesome README files for your GitHub repos. 
            Just paste your repository URL and watch the magic happen! 🚀
          </p>
        </div>

        {/* Private Repository Notice */}
        <div className="max-w-4xl mx-auto mb-8">
          <PrivateRepoNotice />
        </div>

        {/* URL Input Section */}
        <UrlInput onGenerate={handleGenerate} isGenerating={isGenerating} />

        {/* Processing Status */}
        <ProcessingStatus 
          steps={processingSteps} 
          isVisible={isGenerating || (generationResult?.success === false)}
        />

        {/* Error Display */}
        {generationResult && !generationResult.success && (
          <div className="max-w-4xl mx-auto mb-16">
            <Alert variant="destructive" data-testid="error-alert">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Repository Error:</strong> {generationResult.error}
                <ul className="mt-2 text-sm list-disc pl-5">
                  <li>Ensure the repository is public</li>
                  <li>Verify the URL format: https://github.com/username/repo-name</li>
                  <li>Check that the repository exists and is not archived</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* README Preview */}
        <ReadmePreview 
          result={generationResult!} 
          isVisible={!!(generationResult?.success && generationResult.data)}
        />

        {/* Features Grid */}
        <FeaturesGrid />

        {/* Settings Panel */}
        <SettingsPanel settings={settings} onSettingsChange={setSettings} />

        {/* Recent Generations */}
        {recentGenerations.length > 0 && (
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-2xl font-bold mb-8 flex items-center">
              <i className="fas fa-history text-primary mr-3"></i>
              My Recent Projects 📂
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentGenerations.map((generation) => (
                <Card
                  key={generation.id}
                  className="bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => viewRecentGeneration(generation)}
                  data-testid={`recent-generation-${generation.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <i className="fab fa-github text-muted-foreground"></i>
                        <span className="font-mono text-sm text-muted-foreground">
                          {generation.repositoryOwner}/{generation.repositoryName}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(generation.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-medium mb-2">{generation.repositoryName}</h4>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {generation.repositoryData.description || "No description available"}
                    </p>
                    <div className="flex items-center justify-between">
                      {generation.repositoryData.language && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {generation.repositoryData.language}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary/80 text-sm font-medium"
                        data-testid={`view-readme-${generation.id}`}
                      >
                        View README
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
