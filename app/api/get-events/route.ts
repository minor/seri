import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { google } from "googleapis";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "You must be signed in to fetch events" },
        { status: 401 }
      );
    }

    // For demo purposes, return mock events
    // In a real app, this would fetch from Google Calendar API
    const mockEvents = [
      {
        id: "event1",
        title: "Team Meeting",
        start: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
        end: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(),
        backgroundColor: "#FBBC05" // Google yellow
      },
      {
        id: "event2",
        title: "Workout",
        start: new Date(new Date().setHours(18, 0, 0, 0)).toISOString(),
        end: new Date(new Date().setHours(19, 0, 0, 0)).toISOString(),
        backgroundColor: "#4285F4" // Google blue
      }
    ];
    
    return NextResponse.json({ events: mockEvents });
    
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