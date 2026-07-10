import { getDashboardSurveys } from "@/features/surveys/queries";
import Link from "next/link";
import { PlusCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SurveyDataTable } from "@/features/surveys/components/survey-data-table";
import { PageLayout } from "@/components/layout/page-layout";
import { PageHeader } from "@/components/layout/page-header";

export default async function SurveysPage() {
  const surveys = await getDashboardSurveys();

  return (
    <PageLayout>
      <PageHeader
        title="Surveys"
        description="Manage and analyze your surveys."
        action={
          <Button asChild>
            <Link href="/admin/surveys/new">
              <PlusCircle className="mr-2 h-4 w-4" aria-hidden />
              Create Survey
            </Link>
          </Button>
        }
      />

      {surveys.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/30 p-8 text-center animate-in fade-in duration-500">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
            <FileText className="h-10 w-10 text-primary" aria-hidden />
          </div>
          <h2 className="mb-2 text-xl font-semibold">No surveys found</h2>
          <p className="mb-8 max-w-sm text-sm text-muted-foreground">
            You haven&apos;t created any surveys yet. Create your first survey to start collecting
            insights.
          </p>
          <Button asChild>
            <Link href="/admin/surveys/new">
              <PlusCircle className="mr-2 h-4 w-4" aria-hidden />
              Create your first survey
            </Link>
          </Button>
        </div>
      ) : (
        <SurveyDataTable surveys={surveys} />
      )}
    </PageLayout>
  );
}
