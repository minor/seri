"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function SignInButton() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  if (isLoading) {
    return (
      <button
        disabled
        className="rounded-full flex items-center justify-center bg-muted text-muted-foreground gap-2 font-medium text-sm h-10 px-4 w-auto opacity-70"
      >
        Loading...
      </button>
    );
  }

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:opacity-90 font-medium text-sm h-10 px-4 w-auto"
      >
        Sign out
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:opacity-90 font-medium text-sm h-10 px-4 w-auto"
    >
      Sign in with Google
    </button>
  );
}
