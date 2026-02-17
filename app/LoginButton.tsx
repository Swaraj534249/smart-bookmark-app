"use client";

import { createClient } from "@/utils/supabase/client";

export default function LoginButton() {
  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <button
      onClick={handleGoogleLogin}
      className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg px-5 py-3 text-gray-700 font-medium hover:bg-gray-50 hover:shadow transition-all w-full justify-center"
    >
      <svg width="20" height="20" viewBox="0 0 48 48">
        <path
          fill="#EA4335"
          d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.09-6.09C34.46 3.19 29.5 1 24 1 14.82 1 7.07 6.48 3.73 14.22l7.1 5.52C12.54 13.36 17.82 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.52 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.7c-.55 2.96-2.18 5.47-4.64 7.16l7.1 5.52C43.43 37.07 46.52 31.27 46.52 24.5z"
        />
        <path
          fill="#FBBC05"
          d="M10.83 28.26A14.6 14.6 0 0 1 9.5 24c0-1.48.25-2.91.68-4.26l-7.1-5.52A23.94 23.94 0 0 0 0 24c0 3.87.92 7.53 2.54 10.77l7.1-5.52-.81-.99z"
        />
        <path
          fill="#34A853"
          d="M24 47c5.5 0 10.12-1.82 13.5-4.94l-7.1-5.52C28.64 38.13 26.45 39 24 39c-6.18 0-11.46-3.86-13.17-9.24l-7.1 5.52C7.07 43.52 14.82 47 24 47z"
        />
      </svg>
      Sign in with Google
    </button>
  );
}
