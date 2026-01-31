import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function getSession() {
  try {
    const headersList = await headers();
    const cookie = headersList.get("cookie") || "";

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`,
      {
        headers: { cookie },
        credentials: "include",
        cache: "no-store",
      },
    );

    if (!response.ok) return null;

    return response.json();
  } catch {
    return null;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}
