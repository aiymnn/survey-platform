"use client";

import { Save, Loader2, Settings, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";

type BuilderTab = "general" | "structure";

interface BuilderTopbarProps {
  title: string;
  activeTab: BuilderTab;
  onTabChange: (tab: BuilderTab) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function BuilderTopbar({
  title,
  activeTab,
  onTabChange,
  onSave,
  isSaving,
}: BuilderTopbarProps) {
  return (
    <div className="sticky top-0 z-40 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 sm:px-6 lg:px-8 py-3 border-b shadow-sm">
      {/* Title & Subtitle */}
      <div className="space-y-0.5 min-w-0">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 truncate">
          {title || "Untitled Survey"}
        </h1>
        <p className="text-muted-foreground font-medium text-xs truncate">
          {activeTab === "general"
            ? "Manage your survey's metadata and messaging."
            : "Drag and drop to build your question list."}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Tab Switcher */}
        <div className="flex items-center bg-muted/50 p-1 rounded-md border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange("general")}
            className={`rounded px-2 sm:px-3 h-7 text-xs sm:text-sm font-medium transition-all ${
              activeTab === "general"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings className="h-3.5 w-3.5 sm:mr-1.5" aria-hidden />
            <span className="hidden sm:inline-block">General</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange("structure")}
            className={`rounded px-2 sm:px-3 h-7 text-xs sm:text-sm font-medium transition-all ${
              activeTab === "structure"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutTemplate className="h-3.5 w-3.5 sm:mr-1.5" aria-hidden />
            <span className="hidden sm:inline-block">Structure</span>
          </Button>
        </div>

        {/* Save Button */}
        <Button onClick={onSave} disabled={isSaving} size="sm" className="shadow-sm h-8 px-4">
          {isSaving ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="mr-1.5 h-3.5 w-3.5" />
          )}
          Save
        </Button>
      </div>
    </div>
  );
}
