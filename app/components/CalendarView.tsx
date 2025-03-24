"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { motion, AnimatePresence } from "framer-motion";

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
}

interface CalendarViewProps {
  events: Event[];
  newEvents: Event[];
}

export function CalendarView({ events, newEvents }: CalendarViewProps) {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [mounted, setMounted] = useState(false);

  // Combine existing and new events
  useEffect(() => {
    setAllEvents([...events, ...newEvents]);
  }, [events, newEvents]);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full p-6 bg-muted rounded-lg h-[400px] flex items-center justify-center">
        <p>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="w-full mt-6">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full p-6 bg-muted rounded-lg"
        >
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridWeek"
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "dayGridMonth,dayGridWeek",
            }}
            height="auto"
            aspectRatio={1.5}
            events={allEvents}
            eventClassNames={(eventInfo) => {
              // Check if this is a new event
              const isNewEvent = newEvents.some(
                (event) => event.id === eventInfo.event.id
              );
              return isNewEvent ? "fade-in" : "";
            }}
          />
        </motion.div>
      </AnimatePresence>

      {newEvents.length > 0 && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Successfully added {newEvents.length}{" "}
          {newEvents.length === 1 ? "event" : "events"} to your calendar!
        </div>
      )}
    </div>
  );
}
