import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { google } from "googleapis";

// Mock Gemini API response since we don't have real access to it in this demo
const mockGeminiResponse = (taskText: string) => {
  const baseDate = new Date();
  const tomorrow = new Date(baseDate);
  tomorrow.setDate(baseDate.getDate() + 1);
  
  const dayAfterTomorrow = new Date(baseDate);
  dayAfterTomorrow.setDate(baseDate.getDate() + 2);
  
  // Parse the task text for demo purposes
  const events = [];
  
  if (taskText.includes("linalg") || taskText.includes("chapters")) {
    const studyEvent = {
      id: `event-${Date.now()}-1`,
      title: "Study Linear Algebra",
      start: new Date(tomorrow.setHours(10, 0, 0, 0)).toISOString(),
      end: new Date(tomorrow.setHours(12, 0, 0, 0)).toISOString(),
      backgroundColor: "#4285F4" // Google blue
    };
    events.push(studyEvent);
  }
  
  if (taskText.includes("leetcode")) {
    const codingEvent = {
      id: `event-${Date.now()}-2`,
      title: "LeetCode Practice",
      start: new Date(dayAfterTomorrow.setHours(13, 0, 0, 0)).toISOString(),
      end: new Date(dayAfterTomorrow.setHours(16, 0, 0, 0)).toISOString(),
      backgroundColor: "#34A853" // Google green
    };
    events.push(codingEvent);
  }
  
  // Add a default event if no specific tasks detected
  if (events.length === 0) {
    const defaultEvent = {
      id: `event-${Date.now()}-default`,
      title: "Task from Seri",
      start: new Date(tomorrow.setHours(9, 0, 0, 0)).toISOString(),
      end: new Date(tomorrow.setHours(10, 0, 0, 0)).toISOString(),
      backgroundColor: "#EA4335" // Google red
    };
    events.push(defaultEvent);
  }
  
  return events;
};

// Function to add events to Google Calendar
async function addToGoogleCalendar(accessToken: string, events: any[]) {
  const calendar = google.calendar({ version: "v3" });
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  
  const createdEvents = [];
  
  for (const event of events) {
    try {
      const response = await calendar.events.insert({
        auth,
        calendarId: "primary",
        requestBody: {
          summary: event.title,
          start: {
            dateTime: event.start,
          },
          end: {
            dateTime: event.end,
          },
          colorId: Math.floor(Math.random() * 11) + 1, // Random color 1-11
        },
      });
      
      createdEvents.push({
        id: response.data.id,
        title: response.data.summary,
        start: event.start,
        end: event.end,
        backgroundColor: event.backgroundColor
      });
      
    } catch (error) {
      console.error("Error adding event to Google Calendar:", error);
    }
  }
  
  return createdEvents;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.accessToken) {
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
    
    // Process tasks with Gemini (mocked)
    const suggestedEvents = mockGeminiResponse(tasks);
    
    // In a real application, we would add events to Google Calendar
    // For demo, we can mock this as well or use the actual Google Calendar API
    // const createdEvents = await addToGoogleCalendar(session.accessToken, suggestedEvents);
    
    // For now, just return the suggested events
    return NextResponse.json({ events: suggestedEvents });
    
  } catch (error) {
    console.error("Error processing tasks:", error);
    return NextResponse.json(
      { error: "Failed to process tasks" },
      { status: 500 }
    );
  }
} 