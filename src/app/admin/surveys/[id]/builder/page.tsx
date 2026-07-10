import { getSurveyBuilderData } from "@/features/surveys/builder";
import { SurveyBuilderClient } from "./survey-builder-client";
import { notFound } from "next/navigation";
import type { SurveySchemaJson, SurveySettingsData } from "@/features/surveys/types";

interface SurveyBuilderPageProps {
  params: Promise<{ id: string }>;
}

export default async function SurveyBuilderPage({ params }: SurveyBuilderPageProps) {
  const { id } = await params;

  // Fetch data outside try/catch so JSX rendering stays outside the error boundary
  const data = await getSurveyBuilderData(id).catch(() => null);
  if (!data) notFound();

  const initialSchema = data.draftVersion.schemaJson as unknown as SurveySchemaJson;
  const settingsJson = data.survey.settingsJson as {
    welcomeMessage?: string;
    endMessage?: string;
  } | null;

  const initialSettings: SurveySettingsData = {
    title: data.survey.title,
    description: data.survey.description || "",
    welcomeMessage: settingsJson?.welcomeMessage || "",
    endMessage: settingsJson?.endMessage || "",
  };

  return (
    <SurveyBuilderClient
      surveyId={data.survey.id}
      versionId={data.draftVersion.id}
      initialSchema={initialSchema}
      initialSettings={initialSettings}
    />
  );
}
