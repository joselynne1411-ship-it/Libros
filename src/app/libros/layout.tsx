import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/TopNav";

export default async function LibrosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav userName={session.user.name ?? session.user.email ?? ""} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
