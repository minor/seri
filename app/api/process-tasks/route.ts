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
  try {
    // Get user ID from Clerk auth
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
    
    console.log(`[Debug] Processing tasks for user ID: ${userId}`);
    
    // Get user from Clerk
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    
    console.log(`[Debug] User email: ${user.emailAddresses[0]?.emailAddress}`);
    console.log(`[Debug] External accounts count: ${user.externalAccounts.length}`);
    
    // First try: look for any Google account
    const googleAccount = user.externalAccounts.find(
      (account: any) => account.provider === "google"
    );
    
    let accessToken = null;
    
    if (!googleAccount) {
      console.log(`[Debug] No Google account found for user ${userId}`);
      
      // Second try: check for OAuth tokens directly
      try {
        console.log("[Debug] Attempting to get OAuth token directly");
        const tokenResponse = await clerk.users.getUserOauthAccessToken(userId, "oauth_google");
        console.log(`[Debug] OAuth token response length:`, tokenResponse.data?.length || 0);
        
        if (tokenResponse && tokenResponse.data && tokenResponse.data.length > 0) {
          accessToken = tokenResponse.data[0].token;
          if (accessToken) {
            console.log("[Debug] Successfully retrieved OAuth token directly");
          }
        }
        
        if (!accessToken) {
          console.log("[Debug] No OAuth token found in direct request");
        }
      } catch (tokenError) {
        console.error("[Debug] Error getting OAuth token:", tokenError);
      }
      
      if (!accessToken) {
        // Create a more helpful error message
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
      console.log(`[Debug] Found Google account: ${googleAccount.provider}, ID: ${googleAccount.id}`);
      
      // Different Clerk versions store the token in different places
      accessToken = (googleAccount as any).accessToken || (googleAccount as any).token;
      
      console.log(`[Debug] Access token found directly? ${!!accessToken}`);
      
      if (!accessToken) {
        // If we can't find the token directly, try to request it from Clerk
        try {
          console.log("[Debug] Attempting to get OAuth token through API");
          const tokenResult = await clerk.users.getUserOauthAccessToken(
            userId, 
            "oauth_google"
          );
          
          console.log(`[Debug] Token result data length: ${tokenResult.data?.length || 0}`);
          
          if (tokenResult && tokenResult.data && tokenResult.data.length > 0) {
            accessToken = tokenResult.data[0].token;
            if (accessToken) {
              console.log("[Debug] Successfully retrieved OAuth token through API");
            }
          }
          
          if (!accessToken) {
            console.log("[Debug] No token found in API response");
          }
        } catch (tokenError) {
          console.error("[Debug] Error getting OAuth token:", tokenError);
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
    
    console.log("[Debug] Processing tasks with valid access token");
    
    // Use parseEventsFromGemini to generate events
    const suggestedEvents = await parseEventsFromGemini(tasks);
    console.log(`[Debug] Generated ${suggestedEvents.length} events from tasks`);
    
    // Add events to Google Calendar using the access token
    const createdEvents = await addToGoogleCalendar(accessToken, suggestedEvents);
    console.log(`[Debug] Created ${createdEvents.length} events in Google Calendar`);
    
    return NextResponse.json({ events: createdEvents });
    
  } catch (error) {
    console.error("[Debug] Error processing tasks:", error);
    return NextResponse.json(
      { 
        error: "Failed to process tasks",
        message: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}