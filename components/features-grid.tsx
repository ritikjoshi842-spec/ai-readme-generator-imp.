import { Card, CardContent } from "@/components/ui/card";
import { Github, Brain, FileCode, Table, Shield, Download } from "lucide-react";

export function FeaturesGrid() {
  const features = [
    {
      icon: Github,
      title: "GitHub Integration",
      description: "Connects to GitHub and grabs all your repo info automatically - no copy-pasting needed!",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Brain,
      title: "AI Magic ✨",
      description: "Uses Google's Gemini AI to write descriptions and instructions that actually make sense!",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: FileCode,
      title: "Cool Templates",
      description: "Clean, awesome Markdown formatting that makes your project look super professional!",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      icon: Table,
      title: "Project Structure Analysis",
      description: "Automatically analyze and document your project's file structure and architecture.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Shield,
      title: "Error Handling",
      description: "Robust validation and meaningful error messages for invalid or incomplete repositories.",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: Download,
      title: "Export Options",
      description: "Download generated README as .md file or copy to clipboard for immediate use.",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto mb-16">
      <h2 className="text-3xl font-bold text-center mb-12">What Can This Do? 🚀</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="bg-card border border-border hover:border-primary/50 transition-colors"
            data-testid={`feature-card-${index}`}
          >
            <CardContent className="p-6">
              <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                <feature.icon className={`${feature.color} text-xl w-6 h-6`} />
              </div>
              <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
