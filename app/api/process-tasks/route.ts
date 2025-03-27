import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
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
    const now = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'America/New_York' }).format(new Date());

    
    const prompt = `
You are an intelligent calendar assistant. I need you to create calendar events based on the following task description:

"${tasks}"

Current time: ${now}

Please analyze the task description and:
1. Understand ALL timing requirements precisely:
   - Exact times mentioned (e.g., "by 2PM today")
   - Duration specified (e.g., "1 hour")
   - Deadlines (e.g., "by tomorrow")
2. For tasks with a specific deadline time (e.g., "by 2PM today"):
   - ALWAYS schedule between current time and the specified deadline
   - Never schedule after the specified deadline time
3. If no duration is specified, estimate a reasonable duration based on the task's nature
4. If no deadline is specified, assume it should be done within a week
5. If today is mentioned, the task MUST be scheduled today
6. If tomorrow is mentioned, schedule before tomorrow at 11:59 PM

Create 1-3 calendar events following these rules:
1. Total duration must exactly match either:
   - The specified duration (if given)
   - Your estimated duration (if not given)
2. Each event should be minimum 30 mins, maximum 2 hours
3. If the task can be completed in one session, keep it as a single event
4. For same-day deadlines, schedule as soon as possible after current time
5. Avoid scheduling during sleeping hours (11 PM - 7 AM)
6. Prefer business hours when possible
7. If multiple events are needed, space them reasonably

Examples of how to interpret input:
- "Finish updates for Juan by 2PM today (1 hour)" → Schedule 1 hour between current time and 2PM today
- "lin algebra homework by tomorrow (3 hours)" → 3 hours of work due by tomorrow 11:59 PM
- "team meeting tomorrow morning" → Estimate 1 hour, schedule tomorrow between 8 AM - 11 AM
- "write blog post by 5PM" → Estimate duration, must complete before 5PM today
- "quick review of slides" → Estimate shorter duration (30-60 mins), schedule soon

IMPORTANT: For any task with a specific time deadline today, you MUST schedule it between the current time (${now}) and the specified deadline. Never schedule such tasks for tomorrow.

Return the events with appropriate start and end times within the specified window.
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
    // Simplified fallback that creates a 1-hour event for tomorrow morning
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    return [{
      id: `event-${Date.now()}-default`,
      title: tasks || "Task from Seri",
      start: tomorrow.toISOString(),
      end: new Date(tomorrow.getTime() + (60 * 60 * 1000)).toISOString(), // 1 hour
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
      // Silent catch - continue with next event
    }
  }
  
  return createdEvents;
}

// POST handler
export async function POST(request: Request) {
  try {
    const authResult = await auth();
    const userId = authResult.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: "You must be signed in to process tasks" },
        { status: 401 }
      );
    }
    
    const { tasks } = await request.json();
    
    if (!tasks) {
      return NextResponse.json(
        { error: "Tasks are required" },
        { status: 400 }
      );
    }
    
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    
    const googleAccount = user.externalAccounts.find(
      (account: any) => account.provider === "google"
    );
    
    let accessToken = null;
    
    if (!googleAccount) {
      try {
        const tokenResponse = await clerk.users.getUserOauthAccessToken(userId, "google");
        
        if (tokenResponse && tokenResponse.data && tokenResponse.data.length > 0) {
          accessToken = tokenResponse.data[0].token;
        }
      } catch (tokenError) {
        // Silent catch - error will be handled by the return below
      }
      
      if (!accessToken) {
        return NextResponse.json(
          { 
            error: "Google account not connected", 
            message: "Please connect your Google account in account settings to use this feature.",
            userId: userId,
            externalAccountsCount: user.externalAccounts.length
          },
          { status: 400 }
        );
      }
    } else {
      accessToken = (googleAccount as any).accessToken || (googleAccount as any).token;
      
      if (!accessToken) {
        try {
          const tokenResult = await clerk.users.getUserOauthAccessToken(
            userId, 
            "google"
          );
          
          if (tokenResult && tokenResult.data && tokenResult.data.length > 0) {
            accessToken = tokenResult.data[0].token;
          }
        } catch (tokenError) {
          // Silent catch - error will be handled by the return below
        }
      }
      
      if (!accessToken) {
        return NextResponse.json(
          { 
            error: "Google access token not available",
            message: "Your Google account is connected, but we couldn't retrieve an access token. Try reconnecting your account."
          },
          { status: 400 }
        );
      }
    }
    
    const suggestedEvents = await parseEventsFromGemini(tasks);
    const createdEvents = await addToGoogleCalendar(accessToken, suggestedEvents);
    
    return NextResponse.json({ events: createdEvents });
    
  } catch (error) {
    return NextResponse.json(
      { 
        error: "Failed to process tasks",
        message: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}