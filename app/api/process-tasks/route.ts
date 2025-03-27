import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { google as googleApis } from "googleapis";
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateObject } from "ai";
import { z } from "zod";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Define the schema for calendar events
// Updated schema: expects an object with an "events" property.
const eventResponseSchema = z.object({
  events: z.array(
    z.object({
      title: z.string(),
      start: z.string().datetime({ offset: true }),
      end: z.string().datetime({ offset: true }),
      duration: z.string().optional(),
      deadline: z.string().optional(),
      notes: z.string().optional(),
    })
  )
});

// Define interfaces for better type safety
interface ExternalAccount {
  provider: string;
  accessToken?: string;
  token?: string;
}

interface GoogleCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  duration?: string;
  deadline?: string;
  notes?: string;
  description?: string;
  backgroundColor?: string;
}

async function parseEventsFromLLM(tasks: string) {
  try {
    // Get current date and time in ET
    const nowET = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    
    // Update the prompt to include the full date
    const prompt = `
You are an intelligent calendar assistant. I need you to create calendar events based on the following task description:

"${tasks}"

Current date and time: ${nowET}

Please analyze the task description and:
1. Understand ALL timing requirements precisely:
   - Exact times mentioned (e.g., "by 2PM today")
   - Duration specified (e.g., "1 hour")
   - Deadlines (e.g., "by tomorrow")
2. For tasks with a specific deadline time (e.g., "by 2PM today"):
   - ALWAYS schedule between the current time and the specified deadline
   - Never schedule after the specified deadline time
   - IMPORTANT: Today refers to ${nowET.split(',')[0]}
3. If no duration is specified, estimate a reasonable duration based on the task's nature.
4. If no deadline is specified, assume it should be done within a week from now.
5. If today is mentioned, the task MUST be scheduled today (${nowET.split(',')[0]}).
6. If tomorrow is mentioned, schedule for the next calendar day.

Create 1-3 calendar events following these rules:
1. Total duration must exactly match either:
   - The specified duration (if given)
   - Your estimated duration (if not given)
2. Each event should be a minimum of 30 minutes and a maximum of 2 hours.
3. If the task can be completed in one session, keep it as a single event.
4. For same-day deadlines, schedule as soon as possible after the current time.
5. Avoid scheduling during sleeping hours (11 PM - 7 AM).
6. Prefer business hours when possible.
7. If multiple events are needed, space them reasonably.

Examples:
- "Finish updates for Juan by 2PM today (1 hour)" → Schedule 1 hour between the current time and 2PM today.
- "lin algebra homework by tomorrow (3 hours)" → Schedule 3 hours of work due by tomorrow 11:59 PM.
- "team meeting tomorrow morning" → Estimate 1 hour, schedule tomorrow between 8 AM - 11 AM.
- "write blog post by 5PM" → Estimate duration, must complete before 5PM today.
- "quick review of slides" → Estimate a shorter duration (30-60 mins), schedule soon.

IMPORTANT: For any task with a specific time deadline today, you MUST schedule it between the current time (${nowET.split(',')[0]}) and the specified deadline. Never schedule such tasks for tomorrow.

**Return only a valid JSON object that follows this schema exactly:**
{
  "events": [
    {
      "title": string,
      "start": string (ISO 8601 datetime with offset),
      "end": string (ISO 8601 datetime with offset),
      "duration": string (optional, e.g., "1 hour"),
      "deadline": string (optional, e.g., "2PM today"),
      "notes": string (optional, any additional context)
    },
    ...
  ]
}
`;

    // Call the LLM with the updated prompt and schema.
    const { object: result } = await generateObject({
      model: openrouter('anthropic/claude-3.5-sonnet'),
      schema: eventResponseSchema,
      prompt: prompt,
      temperature: 0.3,
    });
    
    // Validate that result.events is an array and non-empty.
    if (!result || !result.events || !Array.isArray(result.events) || result.events.length === 0) {
      throw new Error("No valid events returned from LLM");
    }

    // Enhance events with additional properties.
    const colors = ["#4285F4", "#34A853", "#FBBC05", "#EA4335"];
    return result.events.map((event, index) => ({
      ...event,
      id: `event-${Date.now()}-${index}`,
      backgroundColor: colors[index % colors.length],
    }));
    
  } catch (error) {
    console.error("Error parsing events from LLM:", error);
    // Optionally, you can implement a retry or return an error response.
    throw error;
  }
}


// Function to add events to Google Calendar
async function addToGoogleCalendar(accessToken: string, events: GoogleCalendarEvent[]) {
  const calendar = googleApis.calendar({ version: "v3" });
  const auth = new googleApis.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  
  const createdEvents: GoogleCalendarEvent[] = [];
  
  for (const event of events) {
    try {
      const additionalInfo = [
        event.title.toLowerCase().includes('due') ? '📅 Deadline event' : '📝 Task event',
        event.duration ? `⏱️ Estimated duration: ${event.duration}` : null,
        event.deadline ? `⚠️ Due by: ${event.deadline}` : null
      ].filter(Boolean).join('\n');

      const description = `Automatically scheduled through Seri\n---\n${additionalInfo}`;

      const response = await calendar.events.insert({
        auth: auth,
        calendarId: "primary",
        requestBody: {
          summary: event.title,
          description: description,
          start: {
            dateTime: event.start,
          },
          end: {
            dateTime: event.end,
          },
          colorId: String(Math.floor(Math.random() * 11) + 1),
        },
      });
      
      if (response?.data?.id && response.data.summary) {
        createdEvents.push({
          id: response.data.id,
          title: response.data.summary,
          description: response.data.description ?? '',
          start: event.start,
          end: event.end,
          backgroundColor: event.backgroundColor,
        });
      }
    } catch (_error) {
      // Silent catch - continue with next event
      continue;
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
      (account: ExternalAccount) => account.provider === "google"
    );
    
    let accessToken = null;
    
    if (!googleAccount) {
      try {
        const tokenResponse = await clerk.users.getUserOauthAccessToken(userId, "google");
        
        if (tokenResponse && tokenResponse.data && tokenResponse.data.length > 0) {
          accessToken = tokenResponse.data[0].token;
        }
      } catch {
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
      accessToken = (googleAccount as ExternalAccount).accessToken || (googleAccount as ExternalAccount).token;
      
      if (!accessToken) {
        try {
          const tokenResult = await clerk.users.getUserOauthAccessToken(
            userId, 
            "google"
          );
          
          if (tokenResult && tokenResult.data && tokenResult.data.length > 0) {
            accessToken = tokenResult.data[0].token;
          }
        } catch {
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
    
    const suggestedEvents = await parseEventsFromLLM(tasks);
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