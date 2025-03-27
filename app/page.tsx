import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <nav className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center bg-white/80 backdrop-blur-sm border-b">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          Seri
        </Link>
        <div className="flex items-center gap-4">
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors">
                Sign In
              </button>
            </SignInButton>
          ) : (
            <UserButton afterSignOutUrl="/" />
          )}
        </div>
      </nav>

      <div className="max-w-4xl text-center">
        <h1 className="text-6xl font-bold tracking-tight text-gray-900 sm:text-7xl">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Seri
          </span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Your personal AI assistant that helps you stay organized and
          productive.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          {!isSignedIn ? (
            <SignUpButton mode="modal">
              <button className="rounded-xl bg-gray-900 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900">
                Get started
              </button>
            </SignUpButton>
          ) : (
            <Link
              href="/app"
              className="rounded-xl bg-gray-900 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              Launch App
            </Link>
          )}
          <Link
            href="https://github.com/saurish2010/seri"
            target="_blank"
            className="text-lg font-semibold leading-6 text-gray-900 hover:text-gray-700"
          >
            Learn more <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
