import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  return (
    /*
     * h-screen overflow-hidden: locks the viewport so only the main pane
     * scrolls, keeping the sidebar always visible on desktop. Flex-row puts
     * the sidebar and content side by side.
     */
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <Sidebar name={user.name} email={user.email} />

      {/*
       * flex-1 min-h-0: lets this column shrink below its content height so
       * overflow-y-auto can actually scroll. pt-14 clears the 56px fixed
       * mobile header; desktop needs no extra top padding (sidebar is in-flow).
       */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pt-14 md:pt-0">
        <TopBar />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
