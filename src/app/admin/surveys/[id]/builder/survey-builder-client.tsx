"use client";

import { useState, useTransition, useSyncExternalStore } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import { Type, AlignLeft, CheckCircle2 } from "lucide-react";

import { type SurveySchemaJson, type QuestionSchema, type QuestionType, type SurveySettingsData } from "@/features/surveys/types";
import { updateSurveySchemaAction, updateSurveySettingsAction } from "@/features/surveys/builder";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "./components/question-card";
import { SurveySettingsForm } from "./components/survey-settings-form";
import { BuilderTopbar } from "./components/builder-topbar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SurveyBuilderClientProps {
  surveyId: string;
  versionId: string;
  initialSchema: SurveySchemaJson;
  initialSettings: SurveySettingsData;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SurveyBuilderClient({
  surveyId,
  versionId,
  initialSchema,
  initialSettings,
}: SurveyBuilderClientProps) {
  const [activeTab, setActiveTab] = useState<"general" | "structure">("structure");
  const [settings, setSettings] = useState<SurveySettingsData>(initialSettings);
  const [schema, setSchema] = useState<SurveySchemaJson>(initialSchema);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(
    initialSchema.questions.length > 0 ? initialSchema.questions[0].id : null,
  );
  const [isPending, startTransition] = useTransition();

  // Prevent DndContext hydration errors (useSyncExternalStore is the React-recommended pattern)
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // ─── DnD ──────────────────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSchema((prev) => {
      const oldIndex = prev.questions.findIndex((q) => q.id === active.id);
      const newIndex = prev.questions.findIndex((q) => q.id === over.id);
      return { ...prev, questions: arrayMove(prev.questions, oldIndex, newIndex) };
    });
  };

  // ─── Question Mutations ────────────────────────────────────────────────────

  const addQuestion = (type: QuestionType) => {
    const newQuestion: QuestionSchema = {
      id: crypto.randomUUID(),
      type,
      title: "",
      required: false,
    };
    setSchema((prev) => ({ ...prev, questions: [...prev.questions, newQuestion] }));
    setActiveQuestionId(newQuestion.id);
    setActiveTab("structure");
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 100);
  };

  const updateQuestion = (id: string, updates: Partial<QuestionSchema>) => {
    setSchema((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    }));
  };

  const deleteQuestion = (id: string) => {
    setSchema((prev) => {
      const remaining = prev.questions.filter((q) => q.id !== id);
      if (activeQuestionId === id) {
        setActiveQuestionId(remaining.length > 0 ? remaining[0].id : null);
      }
      return { ...prev, questions: remaining };
    });
  };

  // ─── Save ──────────────────────────────────────────────────────────────────

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
            },
          }),
        ]);
        toast.success("Survey saved successfully");
      } catch {
        toast.error("Failed to save survey");
      }
    });
  };

  // ─── Guard ────────────────────────────────────────────────────────────────

  if (!isMounted) return null;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col w-full">
      <BuilderTopbar
        title={settings.title}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSave={handleSave}
        isSaving={isPending}
      />

      <PageLayout className="pb-28 pt-6">
        {activeTab === "general" ? (
          <SurveySettingsForm data={settings} onChange={setSettings} />
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300 relative min-h-[50vh]">
            {/* Question List */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={schema.questions.map((q) => q.id)}
                strategy={verticalListSortingStrategy}
              >
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

            {/* Empty State */}
            {schema.questions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center border-dashed border-2 rounded-lg bg-card/50 mb-8">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-foreground">No questions yet</h3>
                <p className="text-muted-foreground text-sm max-w-[250px] mt-1">
                  Use the toolbar below to add your first question.
                </p>
              </div>
            )}

            {/* Floating Add-Question Toolbar */}
            <div className="sticky bottom-8 z-50 flex justify-center w-full pointer-events-none mt-8">
              <div className="pointer-events-auto flex flex-row items-center gap-1 bg-background/95 backdrop-blur-md border shadow-2xl px-2 py-1.5 rounded-full transition-transform hover:-translate-y-1 duration-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addQuestion("text_short")}
                  className="rounded-full hover:bg-primary/10 hover:text-primary px-3 sm:px-4 h-9"
                >
                  <Type className="h-4 w-4 mr-1.5 shrink-0" aria-hidden />
                  <span className="text-xs sm:text-sm font-semibold">Short Text</span>
                </Button>
                <div className="w-px h-5 bg-border mx-1" aria-hidden />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addQuestion("text_long")}
                  className="rounded-full hover:bg-primary/10 hover:text-primary px-3 sm:px-4 h-9"
                >
                  <AlignLeft className="h-4 w-4 mr-1.5 shrink-0" aria-hidden />
                  <span className="text-xs sm:text-sm font-semibold">Long Text</span>
                </Button>
                <div className="w-px h-5 bg-border mx-1" aria-hidden />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addQuestion("choice_single")}
                  className="rounded-full hover:bg-primary/10 hover:text-primary px-3 sm:px-4 h-9"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5 shrink-0" aria-hidden />
                  <span className="text-xs sm:text-sm font-semibold">Choice</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </PageLayout>
    </div>
  );
}
