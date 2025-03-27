"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "../components/ThemeToggle";
import { TaskInput } from "../components/TaskInput";
import { CalendarView } from "../components/CalendarView";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
}

export default function AppPage() {
  // const { isSignedIn, user } = useUser();
  const { isSignedIn } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvents, setNewEvents] = useState<Event[]>([]);

  // Fetch existing events when user is authenticated
  useEffect(() => {
    async function fetchEvents() {
      if (isSignedIn) {
        try {
          const response = await fetch("/api/get-events");
          if (!response.ok) throw new Error("Failed to fetch events");

          const data = await response.json();
          setEvents(data.events || []);
        } catch (error) {
          console.error("Error fetching events:", error);
        }
      }
    }

    fetchEvents();
  }, [isSignedIn]);

  // Process tasks and schedule them
  const processTasks = async (tasks: string) => {
    if (!isSignedIn) return;

    setIsProcessing(true);

    try {
      const response = await fetch("/api/process-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tasks }),
      });

      if (!response.ok) throw new Error("Failed to process tasks");

      const data = await response.json();
      setNewEvents(data.events || []);
    } catch (error) {
      console.error("Error processing tasks:", error);
    } finally {
      setIsProcessing(false);
    }
  };

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
        <TaskInput onSubmit={processTasks} isProcessing={isProcessing} />

        {isSignedIn && (
          <div className="w-full mt-10">
            <CalendarView events={events} newEvents={newEvents} />
          </div>
        )}
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
