"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "./components/ThemeToggle";
import { TaskInput } from "./components/TaskInput";
import { CalendarView } from "./components/CalendarView";

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
}

export default function Home() {
  const { data: session } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvents, setNewEvents] = useState<Event[]>([]);

  // Fetch existing events when user is authenticated
  useEffect(() => {
    async function fetchEvents() {
      if (session) {
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
  }, [session]);

  // Process tasks and schedule them
  const processTasks = async (tasks: string) => {
    if (!session) return;

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
        <div className="h-[30px] w-[30px] rounded-full bg-[#DBDBDB]"></div>
        <ThemeToggle />
      </header>

      <main className="flex flex-col items-center w-full max-w-4xl mx-auto">
        <TaskInput onSubmit={processTasks} isProcessing={isProcessing} />

        {session && (
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
