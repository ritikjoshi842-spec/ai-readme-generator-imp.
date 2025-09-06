import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, FileCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { GenerateReadmeResponse } from "@shared/schema";

interface ReadmePreviewProps {
  result: GenerateReadmeResponse;
  isVisible: boolean;
}

export function ReadmePreview({ result, isVisible }: ReadmePreviewProps) {
  const [activeTab, setActiveTab] = useState("source");
  const { toast } = useToast();

  if (!isVisible || !result.success || !result.data) return null;

  const { markdownContent, repositoryData } = result.data;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      toast({
        title: "Copied to Clipboard",
        description: "README content has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy content to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadFile = async () => {
    try {
      if (result.data?.id) {
        const blob = await api.downloadReadme(result.data.id);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${repositoryData.name}-README.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Download Started",
          description: "README file download has started",
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download README file",
        variant: "destructive",
      });
    }
  };

  const renderMarkdownPreview = (content: string) => {
    // Simple markdown rendering for preview
    return content
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mb-3 text-primary">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mb-2">$1</h3>')
      .replace(/^\- (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="code-block rounded p-3 my-4 overflow-x-auto"><code class="font-mono text-sm">$2</code></pre>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="max-w-6xl mx-auto mb-16" data-testid="readme-preview">
      <Card className="bg-card border border-border overflow-hidden">
        <div className="bg-muted px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center">
            <FileCode className="text-accent mr-3" />
            Generated README.md
          </h3>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={copyToClipboard}
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-copy-clipboard"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={downloadFile}
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-download-file"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              onClick={downloadFile}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded text-sm transition-colors"
              data-testid="button-download-readme"
            >
              Download README.md
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-border px-6">
            <TabsList className="bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="source" 
                className="px-4 py-3 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                data-testid="tab-markdown-source"
              >
                Markdown Source
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                className="px-4 py-3 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                data-testid="tab-rendered-preview"
              >
                Rendered Preview
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="source" className="m-0">
            <div className="p-6">
              <h4 className="font-medium mb-4 text-muted-foreground">Markdown Source</h4>
              <div className="code-block rounded-lg p-4 h-96 overflow-y-auto">
                <pre className="text-sm syntax-highlight whitespace-pre-wrap" data-testid="markdown-source">
                  <code>{markdownContent}</code>
                </pre>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="m-0">
            <div className="p-6">
              <h4 className="font-medium mb-4 text-muted-foreground">Rendered Preview</h4>
              <div className="bg-background border border-border rounded-lg p-4 h-96 overflow-y-auto prose prose-invert max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(markdownContent) }}
                  data-testid="rendered-preview"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
