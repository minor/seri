import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { google as googleApis } from "googleapis";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Define the schema for calendar events
const eventSchema = z.array(
  z.object({
    title: z.string(),
    start: z.string().datetime({ offset: true }), // Ensures ISO format
    end: z.string().datetime({ offset: true }),   // Ensures ISO format
  })
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Function to generate events from Gemini response
async function parseEventsFromGemini(tasks: string) {
  try {
    const prompt = `
I need to create calendar events based on the following tasks. Please analyze them and suggest appropriate events with start and end times.
Tasks: ${tasks}

Analyze these tasks and suggest 1-3 calendar events with realistic scheduling in the next few days.
`;

    const { object: events } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: eventSchema,
      prompt: prompt,
      temperature: 0.3,
    });

    // Add colors and IDs to events
    const colors = ["#4285F4", "#34A853", "#FBBC05", "#EA4335"];
    return events.map((event, index) => ({
      ...event,
      id: `event-${Date.now()}-${index}`,
      backgroundColor: colors[index % colors.length],
    }));
  } catch (error) {
    console.error("Error generating events from Gemini:", error);
    
    // Fallback to a default event if generation fails
    const baseDate = new Date();
    const tomorrow = new Date(baseDate);
    tomorrow.setDate(baseDate.getDate() + 1);
    
    return [{
      id: `event-${Date.now()}-default`,
      title: "Task from Seri",
      start: new Date(tomorrow.setHours(9, 0, 0, 0)).toISOString(),
      end: new Date(tomorrow.setHours(10, 0, 0, 0)).toISOString(),
      backgroundColor: "#EA4335",
    }];
  }
}

// Function to add events to Google Calendar
async function addToGoogleCalendar(accessToken: string, events: any[]) {
  const calendar = googleApis.calendar({ version: "v3" });
  const auth = new googleApis.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  
  const createdEvents = [];
  
  for (const event of events) {
    try {
      const response = await calendar.events.insert({
        auth: auth,
        calendarId: "primary",
        requestBody: {
          summary: event.title,
          start: {
            dateTime: event.start,
          },
          end: {
            dateTime: event.end,
          },
          colorId: String(Math.floor(Math.random() * 11) + 1),
        },
      });
      
      if (response && response.data) {
        createdEvents.push({
          id: response.data.id,
          title: response.data.summary,
          start: event.start,
          end: event.end,
          backgroundColor: event.backgroundColor,
        });
      }
    } catch (error) {
      console.error("Error adding event to Google Calendar:", error);
    }
  }
  
  return createdEvents;
}

// POST handler
export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { tasks } = await request.json();

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const googleAccount = user.externalAccounts.find(
      (account) => account.provider === "google"
    ) as any; // temporary type assertion

    if (!googleAccount?.token) {
      return NextResponse.json(
        { error: "Google Calendar not connected" },
        { status: 400 }
      );
    }

    // Process tasks using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Given these tasks: ${tasks}\n\nCreate a schedule for these tasks. Return the response as a JSON array of events with 'title', 'start', and 'end' properties. The dates should be in ISO format.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response and extract events
    const events = JSON.parse(text);

    // Add events to Google Calendar
    const createdEvents = await addToGoogleCalendar(googleAccount.token, events);

    return NextResponse.json({ events: createdEvents });
  } catch (error) {
    console.error("Error processing tasks:", error);
    return NextResponse.json(
      { error: "Failed to process tasks" },
      { status: 500 }
    );
  }
}