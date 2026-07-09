import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Copy } from "lucide-react";
import { QuestionSchema } from "@/features/surveys/types";

interface QuestionSettingsProps {
  question: QuestionSchema;
  onUpdate: (updates: Partial<QuestionSchema>) => void;
  onDelete: () => void;
}

export function QuestionSettings({ question, onUpdate, onDelete }: QuestionSettingsProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-4 pt-6 mt-4 border-t border-border/50">
      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0" disabled title="Duplicate">
        <Copy className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0" 
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-border mx-1 shrink-0" />
      <div className="flex items-center gap-2 shrink-0">
        <Label htmlFor={`req-${question.id}`} className="text-sm font-medium cursor-pointer">Required</Label>
        <Switch 
          id={`req-${question.id}`}
          checked={question.required}
          onCheckedChange={(checked) => onUpdate({ required: checked })}
        />
      </div>
    </div>
  );
}
