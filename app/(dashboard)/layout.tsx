import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="app-shell">
      <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col md:flex-row">
        <AppSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
