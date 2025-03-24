"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { SignInButton } from "./SignInButton";

interface TaskInputProps {
  onSubmit: (tasks: string) => Promise<void>;
  isProcessing: boolean;
}

export function TaskInput({ onSubmit, isProcessing }: TaskInputProps) {
  const { data: session } = useSession();
  const [taskText, setTaskText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim() || isProcessing) return;

    try {
      await onSubmit(taskText);
      setTaskText("");
    } catch (error) {
      console.error("Error processing tasks:", error);
    }
  };

  if (!session) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold">
          hi saurish, what do you have to do this week?
        </h1>
        <p className="text-lg text-muted-foreground">
          just type & seri will take care of the rest.
        </p>
        <SignInButton />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
      <h1 className="text-3xl font-bold">
        hi {session.user?.name?.split(" ")[0] || "there"}, what do you have to
        do this week?
      </h1>
      <p className="text-lg text-muted-foreground">
        just type & seri will take care of the rest.
      </p>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative w-full">
          <input
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="complete 3 chapters of linalg by tomorrow (2 hours)"
            className="w-full rounded-full py-3 px-6 bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!taskText.trim() || isProcessing}
            className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full py-1.5 px-4 
              ${
                !taskText.trim() || isProcessing
                  ? "bg-muted-foreground"
                  : "bg-primary"
              } 
              text-primary-foreground transition-colors`}
          >
            {isProcessing ? "Processing..." : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
