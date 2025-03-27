# Seri - AI Calendar Assistant

Seri is an AI-powered calendar assistant that helps you schedule tasks intelligently. Simply describe your tasks, and let AI organize them in your calendar.

## Features

- 🤖 AI-powered task scheduling using Google's Gemini
- 📅 Google Calendar integration
- 🔐 Secure authentication with Clerk
- 🎨 Beautiful, responsive UI with TailwindCSS
- 🌙 Dark mode support

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- TailwindCSS
- Clerk (Authentication)
- Google Gemini API
- NeonDB (PostgreSQL)

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/seri.git
   cd seri
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:

   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/app
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/app

   # NeonDB
   POSTGRES_URL="postgres://your-connection-string"

   # Gemini API
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Run the development server:

   ```bash
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
seri/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/
│   │   └── sign-up/[[...sign-up]]/
│   ├── api/
│   │   ├── process-tasks/
│   │   └── get-events/
│   ├── app/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   └── page.tsx
├── components/
│   ├── ThemeToggle.tsx
│   ├── TaskInput.tsx
│   └── CalendarView.tsx
└── public/
```

## Setting Up Authentication

1. Create a Clerk account at [clerk.dev](https://clerk.dev)
2. Create a new application
3. Configure Google OAuth in your Clerk dashboard
4. Copy your API keys to `.env.local`

## Setting Up the Database

1. Create a NeonDB account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy your connection string to `.env.local`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Made with ♥️ by Saurish
