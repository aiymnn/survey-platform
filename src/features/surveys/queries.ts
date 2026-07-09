import { auth } from "@/auth";
import { getSurveys } from "./service";
import { redirect } from "next/navigation";

export async function getDashboardSurveys() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return getSurveys(session.user.id);
}