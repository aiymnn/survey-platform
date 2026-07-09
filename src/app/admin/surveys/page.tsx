import { getDashboardSurveys } from "@/features/surveys/queries";
import Link from "next/link";
import { PlusCircle, FileText } from "lucide-react";
import { SurveyDataTable } from "./survey-data-table";
import { PageLayout } from "@/components/layout/page-layout";

export default async function SurveysPage() {
  const surveys = await getDashboardSurveys();

  return (
    <PageLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Surveys
            </h1>
          </div>
          <p className="text-muted-foreground font-medium text-sm md:text-base">
            Manage and analyze your surveys.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/surveys/new"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
          >
            Create Survey
            <PlusCircle className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>

      {surveys.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/30 p-8 text-center animate-in fade-in duration-500">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">No surveys found</h2>
          <p className="mb-8 max-w-sm text-sm text-muted-foreground">
            You haven&apos;t created any surveys yet. Create your first survey to start collecting insights.
          </p>
          <Link
            href="/admin/surveys/new"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-105 transition-all duration-300"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create your first survey
          </Link>
        </div>
      ) : (
        <SurveyDataTable surveys={surveys} />
      )}
    </PageLayout>
  );
}
