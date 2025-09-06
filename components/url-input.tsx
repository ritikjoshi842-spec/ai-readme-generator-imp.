import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Link, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { GenerationSettings } from "@shared/schema";

interface UrlInputProps {
  onGenerate: (url: string, settings: GenerationSettings) => void;
  isGenerating: boolean;
}

export function UrlInput({ onGenerate, isGenerating }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a GitHub repository URL",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    try {
      const validation = await api.validateRepository(url);
      if (!validation.valid) {
        toast({
          title: "Invalid Repository URL",
          description: validation.error || "Please check the URL format",
          variant: "destructive",
        });
        return;
      }

      // Use default settings for now
      const defaultSettings: GenerationSettings = {
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
      };

      onGenerate(url, defaultSettings);
    } catch (error: any) {
      toast({
        title: "Validation Error",
        description: error.message || "Failed to validate repository URL",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const showExample = () => {
    setUrl("https://github.com/facebook/react");
  };

  return (
    <div className="max-w-4xl mx-auto mb-16">
      <Card className="bg-card border border-border shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center mb-6">
            <Link className="text-primary mr-3" />
            <h2 className="text-2xl font-semibold">Repository URL</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type="url"
                placeholder="https://github.com/username/repository-name"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-4 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all font-mono text-lg"
                data-testid="input-repository-url"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <i className="fab fa-github"></i>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                type="submit"
                disabled={isGenerating || isValidating}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                data-testid="button-generate-readme"
              >
                {isGenerating || isValidating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <i className="fas fa-magic"></i>
                )}
                <span>
                  {isValidating ? "Validating..." : isGenerating ? "Generating..." : "Generate README"}
                </span>
              </Button>
              
              <Button 
                type="button"
                variant="secondary"
                onClick={showExample}
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-6 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                data-testid="button-view-example"
              >
                <Eye className="w-5 h-5" />
                <span>View Example</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
