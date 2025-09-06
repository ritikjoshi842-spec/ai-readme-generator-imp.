import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sliders } from "lucide-react";
import type { GenerationSettings } from "@shared/schema";

interface SettingsPanelProps {
  settings: GenerationSettings;
  onSettingsChange: (settings: GenerationSettings) => void;
}

export function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const updateSettings = (updates: Partial<GenerationSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  const updateIncludeSections = (key: keyof GenerationSettings["includeSections"], value: boolean) => {
    updateSettings({
      includeSections: {
        ...settings.includeSections,
        [key]: value,
      },
    });
  };

  const updateIncludeBadges = (key: keyof GenerationSettings["includeBadges"], value: boolean) => {
    updateSettings({
      includeBadges: {
        ...settings.includeBadges,
        [key]: value,
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto mb-16">
      <Card className="bg-card border border-border">
        <CardContent className="p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <Sliders className="text-primary mr-3" />
            Generation Settings
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Content Style</Label>
                <RadioGroup
                  value={settings.style}
                  onValueChange={(value: "professional" | "casual" | "technical") => 
                    updateSettings({ style: value })
                  }
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="professional" id="professional" data-testid="radio-style-professional" />
                    <Label htmlFor="professional" className="cursor-pointer">Professional & Formal</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="casual" id="casual" data-testid="radio-style-casual" />
                    <Label htmlFor="casual" className="cursor-pointer">Casual & Friendly</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="technical" id="technical" data-testid="radio-style-technical" />
                    <Label htmlFor="technical" className="cursor-pointer">Technical & Detailed</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-3 block">Include Sections</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={settings.includeSections.installation}
                      onCheckedChange={(checked) => updateIncludeSections("installation", !!checked)}
                      data-testid="checkbox-include-installation"
                    />
                    <Label className="cursor-pointer">Installation Instructions</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={settings.includeSections.usage}
                      onCheckedChange={(checked) => updateIncludeSections("usage", !!checked)}
                      data-testid="checkbox-include-usage"
                    />
                    <Label className="cursor-pointer">Usage Examples</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={settings.includeSections.contributing}
                      onCheckedChange={(checked) => updateIncludeSections("contributing", !!checked)}
                      data-testid="checkbox-include-contributing"
                    />
                    <Label className="cursor-pointer">Contributing Guidelines</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={settings.includeSections.api}
                      onCheckedChange={(checked) => updateIncludeSections("api", !!checked)}
                      data-testid="checkbox-include-api"
                    />
                    <Label className="cursor-pointer">API Documentation</Label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">README Length</Label>
                <Select
                  value={settings.length}
                  onValueChange={(value: "minimal" | "standard" | "comprehensive") => 
                    updateSettings({ length: value })
                  }
                >
                  <SelectTrigger data-testid="select-readme-length">
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprehensive">Comprehensive (Recommended)</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-3 block">Badge Generation</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={settings.includeBadges.build}
                      onCheckedChange={(checked) => updateIncludeBadges("build", !!checked)}
                      data-testid="checkbox-badge-build"
                    />
                    <Label className="cursor-pointer">Build Status Badges</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={settings.includeBadges.version}
                      onCheckedChange={(checked) => updateIncludeBadges("version", !!checked)}
                      data-testid="checkbox-badge-version"
                    />
                    <Label className="cursor-pointer">Version Badges</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={settings.includeBadges.downloads}
                      onCheckedChange={(checked) => updateIncludeBadges("downloads", !!checked)}
                      data-testid="checkbox-badge-downloads"
                    />
                    <Label className="cursor-pointer">Download Count</Label>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-3 block">Custom Template</Label>
                <Select
                  value={settings.template}
                  onValueChange={(value: "default" | "opensource" | "company" | "personal") => 
                    updateSettings({ template: value })
                  }
                >
                  <SelectTrigger data-testid="select-template">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Template</SelectItem>
                    <SelectItem value="opensource">Open Source Project</SelectItem>
                    <SelectItem value="company">Company Project</SelectItem>
                    <SelectItem value="personal">Personal Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
