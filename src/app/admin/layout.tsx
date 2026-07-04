import { AdminLayout } from "@/components/layout/admin-layout";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  return <AdminLayout user={session.user}>{children}</AdminLayout>;
}
