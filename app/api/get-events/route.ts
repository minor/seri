import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

async function fetchGoogleCalendarEvents(accessToken: string) {
  const calendar = google.calendar({ version: "v3" });
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  
  const now = new Date();
  const oneWeekLater = new Date(now);
  oneWeekLater.setDate(now.getDate() + 7);
  
  try {
    const response = await calendar.events.list({
      auth: auth,
      calendarId: "primary",
      timeMin: now.toISOString(),
      timeMax: oneWeekLater.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });
    
    if (response && response.data && response.data.items) {
      const events = response.data.items.map((event: any) => ({
        id: event.id,
        title: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        backgroundColor: event.colorId ? getColorForId(event.colorId) : "#4285F4",
      }));
      
      return events;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching events from Google Calendar:", error);
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

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "You must be signed in to fetch events" },
        { status: 401 }
      );
    }

    console.log(`[Debug] Fetching events for user ID: ${userId}`);

    // Get the user from Clerk
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    
    console.log(`[Debug] User email: ${user.emailAddresses[0]?.emailAddress}`);
    
    // Debug: Log all external accounts
    console.log(`[Debug] External accounts count: ${user.externalAccounts.length}`);
    user.externalAccounts.forEach((account, index) => {
      console.log(`[Debug] Account ${index}: provider=${account.provider}, identifier=${account.identificationId}`);
    });
    
    // First try: look for any Google account
    const googleAccount = user.externalAccounts.find(
      (account: any) => account.provider === "google"
    );
    
    if (!googleAccount) {
      console.log(`[Debug] No Google account found for user ${userId}`);
      
      // Second try: check for OAuth tokens directly
      try {
        console.log("[Debug] Attempting to get OAuth token directly");
        const tokenResponse = await clerk.users.getUserOauthAccessToken(userId, "oauth_google");
        console.log(`[Debug] OAuth token response:`, JSON.stringify(tokenResponse, null, 2));
        
        if (tokenResponse && tokenResponse.data && tokenResponse.data.length > 0) {
          const token = tokenResponse.data[0].token;
          if (token) {
            console.log("[Debug] Successfully retrieved OAuth token directly");
            return fetchEventsWithToken(token);
          }
        }
        
        console.log("[Debug] No OAuth token found in direct request");
      } catch (tokenError) {
        console.error("[Debug] Error getting OAuth token:", tokenError);
      }
      
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
    
    console.log(`[Debug] Found Google account: ${googleAccount.provider}, ID: ${googleAccount.id}`);
    
    // Different Clerk versions store the token in different places
    // We need to type cast to access these properties
    const accessToken = (googleAccount as any).accessToken || 
                         (googleAccount as any).token;
    
    console.log(`[Debug] Access token found directly? ${!!accessToken}`);
    
    if (!accessToken) {
      // If we can't find the token directly, try to request it from Clerk
      try {
        console.log("[Debug] Attempting to get OAuth token through API");
        const tokenResult = await clerk.users.getUserOauthAccessToken(
          userId, 
          "oauth_google"
        );
        
        console.log(`[Debug] Token result: ${JSON.stringify(tokenResult)}`);
        
        if (tokenResult && tokenResult.data && tokenResult.data.length > 0) {
          const token = tokenResult.data[0].token;
          if (token) {
            console.log("[Debug] Successfully retrieved OAuth token through API");
            return fetchEventsWithToken(token);
          }
        }
        
        console.log("[Debug] No token found in API response");
      } catch (tokenError) {
        console.error("[Debug] Error getting OAuth token:", tokenError);
      }
      
      return NextResponse.json(
        { 
          error: "Google access token not available",
          message: "Your Google account is connected, but we couldn't retrieve an access token. Try reconnecting your account."
        },
        { status: 400 }
      );
    }

    console.log("[Debug] Using directly found access token");
    return fetchEventsWithToken(accessToken);
    
  } catch (error) {
    console.error("[Debug] Error fetching events:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch events",
        message: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

// Helper to fetch events with token and return response
async function fetchEventsWithToken(accessToken: string) {
  try {
    console.log("[Debug] Fetching events with token");
    const events = await fetchGoogleCalendarEvents(accessToken);
    console.log(`[Debug] Found ${events.length} events`);
    return NextResponse.json({ events });
  } catch (error) {
    console.error("[Debug] Error fetching events with token:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch calendar events",
        message: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
} 