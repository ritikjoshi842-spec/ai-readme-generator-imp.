import { Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth-button";
import byteLogo from "@assets/{D21A43E2-AEBA-4540-B586-B964ED88533C}_1756891944721.png";
import maitLogo from "@assets/image_1756892111556.png";

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={byteLogo} alt="BYTE Logo" className="w-10 h-10 rounded-lg border border-border bg-card p-1 shadow-sm" />
            <div>
              <h1 className="text-xl font-bold text-foreground">README Generator</h1>
              <p className="text-sm text-muted-foreground">BYTE Project 1</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <AuthButton />
            <img src={maitLogo} alt="MAIT Delhi Logo" className="w-12 h-12 rounded-lg border border-border bg-card p-1 shadow-sm" />
            <Button variant="ghost" size="icon" data-testid="button-help">
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" data-testid="button-settings">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
