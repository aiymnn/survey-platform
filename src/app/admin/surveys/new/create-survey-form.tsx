"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSurveySchema, type CreateSurveyInput } from "@/features/surveys/validators";
import { createSurveyAction } from "@/features/surveys/actions";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CreateSurveyForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<CreateSurveyInput>({
    resolver: zodResolver(createSurveySchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  function onSubmit(data: CreateSurveyInput) {
    startTransition(async () => {
      try {
        const res = await createSurveyAction(data);
        toast.success("Survey created successfully!");
        router.push(`/admin/surveys/${res.id}/builder`);
      } catch {
        toast.error("Failed to create survey. Please try again.");
      }
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Survey Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g. Customer Satisfaction 2026" {...field} />
                  </FormControl>
                  <FormDescription>
                    The public-facing name of the survey.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Briefly describe the purpose of this survey..." 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="welcomeMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Welcome Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Welcome! Thank you for taking the time to complete this survey..." 
                      className="min-h-[80px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Shown on the first screen before the survey starts.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Thank you! Your responses have been recorded." 
                      className="min-h-[80px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Shown after the participant submits their response.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create & Continue to Builder
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
