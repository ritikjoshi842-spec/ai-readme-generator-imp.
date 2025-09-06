import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Lock, Github } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function PrivateRepoNotice() {
  const { isAuthenticated, login } = useAuth();

  if (isAuthenticated) {
    return null;
  }

  return (
    <Alert className="border-primary/20 bg-primary/5">
      <Lock className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <strong>Need access to private repositories?</strong> Sign in with GitHub to generate READMEs for your private repos securely.
        </div>
        <Button 
          onClick={login}
          size="sm"
          className="ml-4"
          data-testid="private-repo-signin"
        >
          <Github className="w-4 h-4 mr-2" />
          Sign In
        </Button>
      </AlertDescription>
    </Alert>
  );
}