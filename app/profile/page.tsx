import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";

export default async function ProfileRedirectPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("lapak_session")?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) redirect("/login");
  redirect(`/profile/${session.userId}`);
}
