import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import LoginButton from "./LoginButton";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If already logged in, go straight to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-md p-10 flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="text-4xl">🔖</div>
        <h1 className="text-2xl font-bold text-gray-800">Smart Bookmarks</h1>
        <p className="text-gray-500 text-center text-sm">
          Save and manage your favorite links. Sign in to get started.
        </p>
        <LoginButton />
      </div>
    </main>
  );
}
