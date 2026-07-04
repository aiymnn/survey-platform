import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AdminPage() {
  const session = await auth();

  // Protect the route - redirect if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // Redirect to the actual dashboard
  redirect("/admin/dashboard");
}
