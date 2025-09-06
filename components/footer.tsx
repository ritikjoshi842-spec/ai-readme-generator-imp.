import { Button } from "@/components/ui/button";
import { Github, Twitter, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30 backdrop-blur">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fab fa-github text-primary-foreground"></i>
              </div>
              <span className="font-semibold text-lg">README Generator</span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              My cool BYTE project that makes writing README files super easy!
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" data-testid="social-github">
                <Github className="text-xl w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="social-twitter">
                <Twitter className="text-xl w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="social-email">
                <Mail className="text-xl w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">GitHub Integration</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">AI Content Generation</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Cool Templates</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Export Options</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Need Help?</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">How to Use</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Project Info</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Bug Reports</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Say Hi! 👋</a></li>
            </ul>
          </div>
        </div>
        
        
        {/* Footnotes Section */}
        <div className="border-t border-border pt-6 mt-6">
          <div className="text-center">
            <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">Footnotes</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><strong>Author:</strong> Ritik Joshi</p>
              <p><strong>Branch:</strong> CSE-I</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
