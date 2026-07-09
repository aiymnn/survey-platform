"use client";

import { useState, useTransition, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SurveySchemaJson, QuestionSchema, QuestionType } from "@/features/surveys/types";
import { updateSurveySchemaAction, updateSurveySettingsAction } from "@/features/surveys/builder";
import { QuestionCard } from "./components/question-card";
import { SurveySettingsForm, SurveySettingsData } from "./components/survey-settings-form";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { PlusCircle, Type, AlignLeft, CheckCircle2, Save, Loader2, Settings, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";

interface SurveyBuilderClientProps {
  surveyId: string;
  versionId: string;
  initialSchema: SurveySchemaJson;
  initialSettings: SurveySettingsData;
}

export function SurveyBuilderClient({ surveyId, versionId, initialSchema, initialSettings }: SurveyBuilderClientProps) {
  const [activeTab, setActiveTab] = useState<"general" | "structure">("structure");
  const [isMounted, setIsMounted] = useState(false);

  // State
  const [settings, setSettings] = useState<SurveySettingsData>(initialSettings);
  const [schema, setSchema] = useState<SurveySchemaJson>(initialSchema);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(
    initialSchema.questions.length > 0 ? initialSchema.questions[0].id : null
  );

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSchema((prev) => {
        const oldIndex = prev.questions.findIndex((q) => q.id === active.id);
        const newIndex = prev.questions.findIndex((q) => q.id === over.id);
        return {
          ...prev,
          questions: arrayMove(prev.questions, oldIndex, newIndex),
        };
      });
    }
  };

  const addQuestion = (type: QuestionType) => {
    const newId = crypto.randomUUID();
    const newQuestion: QuestionSchema = {
      id: newId,
      type,
      title: "",
      required: false,
    };

    setSchema(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setActiveQuestionId(newId);
    setActiveTab("structure");

    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const updateQuestion = (id: string, updates: Partial<QuestionSchema>) => {
    setSchema(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === id ? { ...q, ...updates } : q)
    }));
  };

  const deleteQuestion = (id: string) => {
    setSchema(prev => {
      const newQuestions = prev.questions.filter(q => q.id !== id);
      if (activeQuestionId === id) {
        setActiveQuestionId(newQuestions.length > 0 ? newQuestions[0].id : null);
      }
      return { ...prev, questions: newQuestions };
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        await Promise.all([
          updateSurveySchemaAction(versionId, schema),
          updateSurveySettingsAction(surveyId, {
            title: settings.title,
            description: settings.description,
            settingsJson: {
              welcomeMessage: settings.welcomeMessage,
              endMessage: settings.endMessage,
            }
          })
        ]);
        toast.success("Survey saved successfully");
      } catch {
        toast.error("Failed to save survey");
      }
    });
  };

  if (!isMounted) {
    return null; // Prevents DndContext hydration errors
  }

  return (
    <div className="flex flex-col w-full relative">
      {/* Sticky Topbar Section (Full Width, Flush) */}
      <div className="sticky top-0 z-40 w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 sm:px-6 lg:px-8 py-4 border-b shadow-sm">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 truncate">
              {settings.title || "Untitled Survey"}
            </h1>
            <span className="inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-muted text-muted-foreground">
              Draft
            </span>
          </div>
          <p className="text-muted-foreground font-medium text-xs md:text-sm truncate">
            {activeTab === "general" ? "Manage your survey's metadata and messaging." : "Drag and drop to build your question list."}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 md:gap-4 shrink-0">
          
          {/* Tabs */}
          <div className="flex items-center bg-muted/50 p-1 rounded-md border">
            <button 
              onClick={() => setActiveTab("general")}
              className={`flex items-center text-xs md:text-sm font-medium px-2 md:px-3 py-1.5 rounded transition-all ${activeTab === 'general' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Settings className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline-block">General</span>
            </button>
            <button 
              onClick={() => setActiveTab("structure")}
              className={`flex items-center text-xs md:text-sm font-medium px-2 md:px-3 py-1.5 rounded transition-all ${activeTab === 'structure' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutTemplate className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline-block">Structure</span>
            </button>
          </div>

          <Button onClick={handleSave} disabled={isPending} className="shadow-md h-9">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
            Save
          </Button>
        </div>
      </div>

      <PageLayout className="pb-24 pt-6">
        <div className="w-full relative">
        {activeTab === "general" ? (
          <SurveySettingsForm data={settings} onChange={setSettings} />
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300 relative min-h-[50vh]">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={schema.questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
                {schema.questions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    isActive={activeQuestionId === question.id}
                    onActivate={() => setActiveQuestionId(question.id)}
                    onUpdate={updateQuestion}
                    onDelete={deleteQuestion}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {schema.questions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center border-dashed border-2 rounded-lg bg-card/50 mb-8">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-foreground">No questions yet</h3>
                <p className="text-muted-foreground text-sm max-w-[250px] mt-1">
                  Use the floating toolbar to add your first question.
                </p>
              </div>
            )}

            {/* Sticky Contextual Toolbar for Questions (Centered to Content) */}
            <div className="sticky bottom-8 z-50 flex justify-center w-full pointer-events-none mt-8">
              <div className="pointer-events-auto flex flex-row gap-1 sm:gap-2 bg-background/95 backdrop-blur-md border shadow-2xl p-1.5 sm:p-2 rounded-full transition-transform hover:-translate-y-1 duration-200">
                <Button variant="ghost" onClick={() => addQuestion("text_short")} className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors px-3 sm:px-4">
                  <Type className="h-4 w-4 mr-1.5 sm:mr-2 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold">Short Text</span>
                </Button>
                <Button variant="ghost" onClick={() => addQuestion("text_long")} className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors px-3 sm:px-4">
                  <AlignLeft className="h-4 w-4 mr-1.5 sm:mr-2 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold">Long Text</span>
                </Button>
                <Button variant="ghost" onClick={() => addQuestion("choice_single")} className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors px-3 sm:px-4">
                  <CheckCircle2 className="h-4 w-4 mr-1.5 sm:mr-2 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold">Choice</span>
                </Button>
              </div>
            </div>
          </div>
        )}
          </div>
        </PageLayout>
      </div>
    );
  }
