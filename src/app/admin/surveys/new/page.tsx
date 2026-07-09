import { CreateSurveyForm } from "./create-survey-form";

export default function NewSurveyPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create a New Survey</h1>
        <p className="text-muted-foreground">
          Start by giving your survey a title and description. You&apos;ll be able to add questions in the builder.
        </p>
      </div>

      <CreateSurveyForm />
    </div>
  );
}
