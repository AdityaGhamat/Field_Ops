import { authClient } from "@/lib/auth-lib/auth-client";
import { auth } from "@/lib/auth-lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
export default async function AuthLayout({ children }: any) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    redirect("/");
  }
  return <>{children}</>;
}
