# Seri - AI Task Planner

Seri is an application designed to assist users in planning their tasks by integrating them into their calendar. The app leverages Google authentication for seamless access and employs Gemini, an AI-driven tool, to process user input, understand task contexts, and schedule them appropriately across the week.

## Features

- **Authentication:** Sign in with Google to access your Google Calendar
- **Task Input:** Provide task details through a simple input interface using natural language
- **Task Processing:** AI-powered scheduling of tasks across your week
- **Calendar Integration:** Events are added to your Google Calendar
- **Visual Feedback:** Animations when adding events to the calendar

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Google API credentials (OAuth 2.0 Client ID)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/seri.git
   cd seri
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Create a `.env.local` file with the following variables:

   ```
   # Authentication (Google)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret

   # Gemini API
   GEMINI_API_KEY=your-gemini-api-key
   ```

4. Start the development server:

   ```bash
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Technology Stack

- **Frontend Framework:** Next.js 15
- **UI Library:** React 19
- **Styling:** TailwindCSS 4
- **Authentication:** NextAuth.js with Google provider
- **Calendar Visualization:** FullCalendar
- **Animations:** Framer Motion
- **AI Processing:** Gemini API
- **Calendar Integration:** Google Calendar API

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Made with ♥️ by Saurish
