import { getSurveyBuilderData } from "@/features/surveys/builder";
import { SurveyBuilderClient } from "./survey-builder-client";
import { notFound } from "next/navigation";
import { SurveySchemaJson } from "@/features/surveys/types";

export default async function SurveyBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const data = await getSurveyBuilderData(id);
    const initialSchema = data.draftVersion.schemaJson as unknown as SurveySchemaJson;

    // Type casting settingsJson to ensure we handle the structure correctly
    const settingsJson = data.survey.settingsJson as { welcomeMessage?: string; endMessage?: string; } | null;

    const initialSettings = {
      title: data.survey.title,
      description: data.survey.description || "",
      welcomeMessage: settingsJson?.welcomeMessage || "",
      endMessage: settingsJson?.endMessage || "",
    };

    return (
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <SurveyBuilderClient 
          surveyId={data.survey.id}
          versionId={data.draftVersion.id}
          initialSchema={initialSchema}
          initialSettings={initialSettings}
        />
      </div>
    );
  } catch (error) {
    notFound();
  }
}
