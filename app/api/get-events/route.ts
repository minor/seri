import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
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
        backgroundColor: event.colorId ? getColorForId(event.colorId) : "#4285F4", // Default to Google blue
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
    const session = await getServerSession(authOptions);
    
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "You must be signed in to fetch events" },
        { status: 401 }
      );
    }

    // Get real events from Google Calendar
    const events = await fetchGoogleCalendarEvents(session.accessToken as string);
    
    return NextResponse.json({ events });
    
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// Uncomment to use the real Google Calendar API
/*
async function fetchGoogleCalendarEvents(accessToken: string) {
  const calendar = google.calendar({ version: "v3" });
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  
  const now = new Date();
  const oneWeekLater = new Date(now);
  oneWeekLater.setDate(now.getDate() + 7);
  
  try {
    const response = await calendar.events.list({
      auth,
      calendarId: "primary",
      timeMin: now.toISOString(),
      timeMax: oneWeekLater.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });
    
    const events = response.data.items.map((event) => ({
      id: event.id,
      title: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
    }));
    
    return events;
  } catch (error) {
    console.error("Error fetching events from Google Calendar:", error);
    throw error;
  }
}
*/ 