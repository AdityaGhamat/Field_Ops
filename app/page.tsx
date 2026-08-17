"use client";
import { authClient } from "@/lib/auth-lib/auth-client";
import { redirect } from "next/navigation";
import { showAuthSuccess } from "@/components/auth/auth-toast";
export default function Home() {
  async function handleLogout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          showAuthSuccess("You have been logged out.");
          redirect("/signin");
        },
      },
    });
  }
  return (
    <>
      <span className="text-black">Home</span>
      <button onClick={handleLogout}>Logout</button>
    </>
  );
}
