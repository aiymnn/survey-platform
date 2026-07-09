"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { QuestionSchema, QuestionType } from "@/features/surveys/types";

interface QuestionCardProps {
  question: QuestionSchema;
  isActive: boolean;
  onActivate: () => void;
  onUpdate: (id: string, updates: Partial<QuestionSchema>) => void;
  onDelete: (id: string) => void;
}

export function QuestionCard({ question, isActive, onActivate, onUpdate, onDelete }: QuestionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case "text_short": return "Short Text";
      case "text_long": return "Long Text";
      case "choice_single": return "Single Choice";
      default: return type;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group mb-3">
      <Card 
        className={`overflow-hidden transition-all duration-300 border-l-4 cursor-pointer
          ${isDragging ? "border-l-primary shadow-2xl ring-2 ring-primary/20 scale-105" : 
            isActive ? "border-l-primary shadow-md border-border/60" : "border-l-transparent hover:border-l-primary/50 hover:shadow-sm"
          }`}
        onClick={() => {
          if (!isActive) onActivate();
        }}
      >
        <div className="flex gap-2 sm:gap-4 p-3 sm:p-4">
          <div 
            {...attributes} 
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground transition-colors touch-none"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-5 w-5" />
          </div>
          
          <div className="flex-1 space-y-4 overflow-hidden">
            
            {/* Header (Always Visible) */}
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1 flex-1 min-w-0">
                {isActive ? (
                  <Input 
                    value={question.title} 
                    onChange={(e) => onUpdate(question.id, { title: e.target.value })}
                    placeholder="Question title"
                    className="font-semibold text-base sm:text-lg border-input bg-background px-3 py-6 shadow-inner"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div className="font-medium text-base truncate py-1">
                    {question.title || <span className="text-muted-foreground italic">Untitled Question</span>}
                    {question.required && <span className="text-destructive ml-1">*</span>}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline-block text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded-md font-medium border">
                  {getQuestionTypeLabel(question.type)}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(question.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Expanded Content (Only visible if isActive) */}
            {isActive && (
              <div 
                className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300"
                onClick={(e) => e.stopPropagation()} // prevent collapsing when interacting with settings
              >
                
                {/* Previews based on question type */}
                <div className="pl-4 border-l-2 border-primary/20 py-2 mb-6 bg-muted/30 rounded-r-lg">
                  {question.type === "text_short" && (
                    <Input disabled placeholder="Short answer text" className="bg-background/50 max-w-sm pointer-events-none" />
                  )}
                  {question.type === "text_long" && (
                    <div className="h-24 max-w-2xl rounded-md border border-input bg-background/50 p-3 text-sm text-muted-foreground">
                      Long answer text
                    </div>
                  )}
                  {question.type === "choice_single" && (
                    <div className="space-y-3">
                      {[1, 2, 3].map((opt) => (
                        <div key={opt} className="flex items-center gap-3">
                          <div className="h-4 w-4 rounded-full border border-primary/50 bg-background" />
                          <Input 
                            value={`Option ${opt}`}
                            disabled
                            className="bg-background/50 max-w-sm h-8 pointer-events-none" 
                          />
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" className="text-primary mt-2" disabled>
                        + Add Option (Coming soon)
                      </Button>
                    </div>
                  )}
                </div>

                {/* Settings Toolbar */}
                <div className="flex flex-wrap justify-end items-center gap-4 pt-4 border-t border-border/50 bg-background">
                  <div className="flex items-center gap-2">
                    <Switch 
                      id={`required-${question.id}`} 
                      checked={question.required}
                      onCheckedChange={(checked) => onUpdate(question.id, { required: checked })}
                    />
                    <Label htmlFor={`required-${question.id}`} className="text-sm cursor-pointer">
                      Required
                    </Label>
                  </div>
                </div>

              </div>
            )}
            
          </div>
        </div>
      </Card>
    </div>
  );
}
