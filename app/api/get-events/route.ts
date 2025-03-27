import { auth, clerkClient } from "@clerk/nextjs/server";
import type { ExternalAccount } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { google } from "googleapis";

interface GoogleCalendarEvent {
  id?: string | null;
  summary?: string | null;
  start?: {
    dateTime?: string | null;
    date?: string | null;
  } | null;
  end?: {
    dateTime?: string | null;
    date?: string | null;
  } | null;
  colorId?: string | null;
}

async function fetchGoogleCalendarEvents(accessToken: string) {
  const calendar = google.calendar({ version: "v3" });
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  
  // Calculate start of the current week (Sunday)
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Go back to Sunday
  startOfWeek.setHours(0, 0, 0, 0); // Start of the day
  
  // Calculate one month from now for the end date
  const oneMonthLater = new Date(now);
  oneMonthLater.setMonth(now.getMonth() + 1);
  
  try {
    const response = await calendar.events.list({
      auth: auth,
      calendarId: "primary",
      timeMin: startOfWeek.toISOString(),
      timeMax: oneMonthLater.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 100,
    });
    
    if (response && response.data && response.data.items) {
      const events = response.data.items.map((event) => ({
        id: event.id || '',
        title: event.summary || 'Untitled Event',
        start: event.start?.dateTime || event.start?.date || '',
        end: event.end?.dateTime || event.end?.date || '',
        backgroundColor: event.colorId ? getColorForId(event.colorId) : "#4285F4",
      }));
      
      return events;
    }
    
    return [];
  } catch (error) {
    throw error;
  }
}

// Helper function to map Google Calendar colorId to hex color
function getColorForId(colorId: string): string {
  const colorMap: Record<string, string> = {
    "1": "#7986CB", // Lavender
    "2": "#33B679", // Sage
    "3": "#8E24AA", // Grape
    "4": "#E67C73", // Flamingo
    "5": "#F6BF26", // Banana
    "6": "#F4511E", // Tangerine
    "7": "#039BE5", // Peacock
    "8": "#616161", // Graphite
    "9": "#3F51B5", // Blueberry
    "10": "#0B8043", // Basil
    "11": "#D50000", // Tomato
  };
  
  return colorMap[colorId] || "#4285F4"; // Default to Google blue
}

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "You must be signed in to fetch events" },
        { status: 401 }
      );
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    
    const googleAccount = user.externalAccounts.find(
      (account) => account.provider === "google"
    ) as ExternalAccount & { token: string };
    
    if (!googleAccount) {
      try {
        const tokenResponse = await clerk.users.getUserOauthAccessToken(userId, "google");
        
        if (tokenResponse && tokenResponse.data && tokenResponse.data.length > 0) {
          const token = tokenResponse.data[0].token;
          if (token) {
            return fetchEventsWithToken(token);
          }
        }
      } catch (_) {
        // Silent catch - error will be handled by the return below
      }
      
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
    
    const accessToken = googleAccount.token;
    
    if (!accessToken) {
      try {
        const tokenResult = await clerk.users.getUserOauthAccessToken(
          userId, 
          "google"
        );
        
        if (tokenResult && tokenResult.data && tokenResult.data.length > 0) {
          const token = tokenResult.data[0].token;
          if (token) {
            return fetchEventsWithToken(token);
          }
        }
      } catch (_) {
        // Silent catch - error will be handled by the return below
      }
      
      return NextResponse.json(
        { 
          error: "Google access token not available",
          message: "Your Google account is connected, but we couldn't retrieve an access token. Try reconnecting your account."
        },
        { status: 400 }
      );
    }

    return fetchEventsWithToken(accessToken);
    
  } catch (error) {
    return NextResponse.json(
      { 
        error: "Failed to fetch events",
        message: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

async function fetchEventsWithToken(accessToken: string) {
  try {
    const events = await fetchGoogleCalendarEvents(accessToken);
    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json(
      { 
        error: "Failed to fetch calendar events",
        message: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
} 