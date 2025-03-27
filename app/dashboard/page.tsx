import { SignedIn, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "../components/ThemeToggle";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
}

export default async function Dashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  if (!user) {
    return null;
  }

  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center min-h-screen p-8 pb-20 gap-10 sm:p-10 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full flex justify-between sm:px-8 items-center gap-4">
        <div className="flex items-center space-x-8">
          <a
            href="/app"
            className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300/85 to-gray-100/95"
            aria-label="Seri logo"
          />
          <nav className="hidden sm:flex space-x-6">
            <Link
              href="/dashboard"
              className="text-md font-medium text-gray-700 hover:text-gray-900"
            >
              Dashboard
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          {/* <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            {user?.firstName?.[0]}
          </div> */}
        </div>
      </header>

      <main className="flex flex-col items-center w-full max-w-4xl mx-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Account Information
              </h3>
              <div className="mt-5 border-t border-gray-200">
                <dl className="divide-y divide-gray-200">
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {user.firstName} {user.lastName}
                    </dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {user.emailAddresses[0]?.emailAddress}
                    </dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Account Created
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center text-muted-foreground text-sm">
        hacked together with ♡ by{" "}
        <a href="https://saurish.com" className="underline hover:text-black/70">
          saurish
        </a>{" "}
        | 2025 © seri
      </footer>
    </div>
  );
}
