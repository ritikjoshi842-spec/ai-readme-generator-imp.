import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Loader2, XCircle } from "lucide-react";
import type { ProcessingStep } from "../../../server/services/readme-generator";

interface ProcessingStatusProps {
  steps: ProcessingStep[];
  isVisible: boolean;
}

export function ProcessingStatus({ steps, isVisible }: ProcessingStatusProps) {
  if (!isVisible) return null;

  const completedSteps = steps.filter(step => step.status === "completed").length;
  const progressPercentage = Math.round((completedSteps / steps.length) * 100);

  return (
    <div className="max-w-4xl mx-auto mb-16" data-testid="processing-status">
      <Card className="bg-card border border-border">
        <CardContent className="p-8">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Loader2 className="animate-spin mr-3" />
            Processing Repository
          </h3>
          
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center space-x-3">
                {step.status === "completed" && (
                  <CheckCircle className="text-primary w-5 h-5" data-testid={`step-completed-${index}`} />
                )}
                {step.status === "processing" && (
                  <Loader2 className="text-accent animate-spin w-5 h-5" data-testid={`step-processing-${index}`} />
                )}
                {step.status === "failed" && (
                  <XCircle className="text-destructive w-5 h-5" data-testid={`step-failed-${index}`} />
                )}
                {step.status === "pending" && (
                  <Circle className="text-muted-foreground w-5 h-5" data-testid={`step-pending-${index}`} />
                )}
                <span className={
                  step.status === "completed" ? "text-primary" :
                  step.status === "processing" ? "text-accent" :
                  step.status === "failed" ? "text-destructive" :
                  "text-muted-foreground"
                }>
                  {step.step}
                </span>
                {step.message && (
                  <span className="text-sm text-muted-foreground">- {step.message}</span>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 bg-muted rounded-lg p-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span data-testid="progress-percentage">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
