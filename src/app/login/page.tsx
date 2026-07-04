import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const session = await auth();

  // If the user is already logged in, redirect them to the admin dashboard
  if (session?.user) {
    redirect("/admin");
  }

  return (
    <main className="flex flex-col flex-1 items-center justify-center bg-slate-50 dark:bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <LoginForm />
    </main>
  );
}
