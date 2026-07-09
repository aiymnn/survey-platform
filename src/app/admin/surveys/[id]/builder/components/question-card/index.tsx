import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { QuestionSchema } from "@/features/surveys/types";

// Sub-components
import { QuestionHeader } from "./question-header";
import { QuestionSettings } from "./question-settings";
import { ShortTextPreview } from "./previews/short-text-preview";
import { LongTextPreview } from "./previews/long-text-preview";
import { SingleChoicePreview } from "./previews/single-choice-preview";

interface QuestionCardProps {
  question: QuestionSchema;
  isActive: boolean;
  onActivate: () => void;
  onUpdate: (id: string, updates: Partial<QuestionSchema>) => void;
  onDelete: (id: string) => void;
}

export function QuestionCard({ 
  question, 
  isActive, 
  onActivate, 
  onUpdate, 
  onDelete 
}: QuestionCardProps) {
  
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
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleUpdate = (updates: Partial<QuestionSchema>) => {
    onUpdate(question.id, updates);
  };

  return (
    <div ref={setNodeRef} style={style} className="relative w-full mb-4 group" onClick={onActivate}>
      
      {/* Drag Handle */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <div 
          {...attributes} 
          {...listeners}
          className="bg-card border shadow-sm rounded-md p-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        >
          <GripHorizontal className="h-4 w-4" />
        </div>
      </div>

      <Card 
        className={`bg-card transition-all duration-200 overflow-hidden ${
          isActive 
            ? "border-l-4 border-l-primary shadow-md border-border/80 ring-1 ring-border" 
            : "border-l-4 border-l-transparent hover:border-border cursor-pointer shadow-sm"
        }`}
      >
        <div className="p-4 sm:p-5 md:p-6 space-y-4">
          
          <QuestionHeader 
            question={question} 
            isActive={isActive} 
            onUpdate={handleUpdate} 
          />

          <div className="w-full">
            {question.type === "text_short" && <ShortTextPreview />}
            {question.type === "text_long" && <LongTextPreview />}
            {question.type === "choice_single" && (
              <SingleChoicePreview 
                question={question} 
                isActive={isActive} 
                onUpdate={handleUpdate} 
              />
            )}
          </div>

          {isActive && (
            <QuestionSettings 
              question={question} 
              onUpdate={handleUpdate} 
              onDelete={() => onDelete(question.id)} 
            />
          )}

        </div>
      </Card>
    </div>
  );
}
