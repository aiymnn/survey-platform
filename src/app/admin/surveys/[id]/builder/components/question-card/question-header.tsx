import { Input } from "@/components/ui/input";
import { QuestionSchema } from "@/features/surveys/types";

interface QuestionHeaderProps {
  question: QuestionSchema;
  isActive: boolean;
  onUpdate: (updates: Partial<QuestionSchema>) => void;
}

export function QuestionHeader({ question, isActive, onUpdate }: QuestionHeaderProps) {
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "text_short": return "Short Text";
      case "text_long": return "Long Text";
      case "choice_single": return "Single Choice";
      default: return type;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 w-full">
      <div className="flex-1 w-full">
        {isActive ? (
          <Input 
            value={question.title} 
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Question Title"
            className="font-medium text-base h-10 w-full bg-muted/30 border-transparent hover:border-input focus:border-primary focus:bg-background transition-colors"
          />
        ) : (
          <div className="font-medium text-base py-2 w-full break-words">
            {question.title || <span className="text-muted-foreground italic">Untitled Question</span>}
            {question.required && <span className="text-destructive ml-1">*</span>}
          </div>
        )}
      </div>
      
      {!isActive && (
        <span className="shrink-0 self-start text-xs text-muted-foreground bg-muted px-2 py-1 rounded border">
          {getTypeLabel(question.type)}
        </span>
      )}
    </div>
  );
}
