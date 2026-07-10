import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { QuestionSchema } from "@/features/surveys/types";

interface SingleChoicePreviewProps {
  question: QuestionSchema;
  isActive: boolean;
  onUpdate: (updates: Partial<QuestionSchema>) => void;
}

export function SingleChoicePreview({ question, isActive, onUpdate }: SingleChoicePreviewProps) {
  
  // Ensure options exist
  const options = question.options || [
    { id: crypto.randomUUID(), label: "Option 1", value: "Option 1" }
  ];

  const updateOption = (id: string, newLabel: string) => {
    const newOptions = options.map(opt => 
      opt.id === id ? { ...opt, label: newLabel, value: newLabel } : opt
    );
    onUpdate({ options: newOptions });
  };

  const addOption = () => {
    const newId = crypto.randomUUID();
    const newCount = options.length + 1;
    const newOptions = [
      ...options, 
      { id: newId, label: `Option ${newCount}`, value: `Option ${newCount}` }
    ];
    onUpdate({ options: newOptions });
  };

  const removeOption = (id: string) => {
    if (options.length <= 1) return; // Don't remove the last option
    const newOptions = options.filter(opt => opt.id !== id);
    onUpdate({ options: newOptions });
  };

  return (
    <div className="space-y-2 pt-2 w-full sm:max-w-md">
      {options.map((opt, index) => (
        <div key={opt.id} className="flex items-center gap-3 w-full group">
          <div className="h-4 w-4 rounded-full border border-primary/50 shrink-0" />
          
          {isActive ? (
            <div className="flex-1 flex items-center gap-2">
              <Input 
                value={opt.label} 
                onChange={(e) => updateOption(opt.id, e.target.value)}
                className="h-8 flex-1 border-transparent hover:border-input focus:border-primary focus:bg-background transition-colors"
                placeholder={`Option ${index + 1}`}
              />
              {options.length > 1 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={() => removeOption(opt.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <span className="text-sm py-1">{opt.label}</span>
          )}
        </div>
      ))}
      
      {isActive && (
        <div className="flex items-center gap-3 mt-2">
          <div className="h-4 w-4 rounded-full border border-transparent shrink-0" />
          <Button 
            variant="link" 
            size="sm" 
            className="px-0 h-auto text-muted-foreground hover:text-primary" 
            onClick={addOption}
          >
            + Add option
          </Button>
        </div>
      )}
    </div>
  );
}
