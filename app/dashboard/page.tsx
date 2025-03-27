import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

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
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/app" className="text-2xl font-bold">
              seri
            </Link>
            <nav className="flex items-center space-x-8">
              <Link
                href="/app"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Calendar
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-black"
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 py-10">
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

      <footer className="text-center p-8 text-sm text-gray-500">
        hacked together with ♡ by{" "}
        <a href="https://saurish.com" className="underline hover:text-gray-700">
          saurish
        </a>{" "}
        | 2025 © seri
      </footer>
    </div>
  );
}
