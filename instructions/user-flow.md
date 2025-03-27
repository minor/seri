# Seri App Onboarding and Authentication PRD

## Introduction

### Current State of the App

The Seri app is an existing product with the following key components:

- **Authentication:** Utilizes NextAuth for Google-based sign-in, enabling access to Google Calendar.
- **Main Interface:** Located at the root route (`/`), it features a task input area and a calendar view for authenticated users.
- **API Routes:** Includes endpoints for task processing (`/api/process-tasks`) and fetching events (`/api/get-events`) from Google Calendar.
- **AI Integration:** Leverages Gemini for AI-driven task scheduling and calendar event generation.
- **UI and Styling:** Employs TailwindCSS for a responsive, utility-first design.

### Desired Changes

We aim to enhance the Seri app by introducing the following new features:

1. A landing page at `/` with sign-up and sign-in options.
2. Backend integration using Clerk Dev for authentication and NeonDB for database management.
3. A dashboard page at `/dashboard` to display user account information.

These updates transition the app from NextAuth to Clerk Dev for authentication and introduce NeonDB for future scalability, while moving the existing main interface to `/app`. Importantly, **these are new features being added to the existing Seri app**, not the creation of a brand new product.

## New Features

### 1. Landing Page

- **Purpose:** Provide a primary entry point for both new and existing users, offering clear sign-up and sign-in options.
- **Description:**
  - For unauthenticated users: Displays simple sign-up and sign-in buttons.
  - For authenticated users: Redirects to the main app interface at `/app`.
- **Implementation Approach:**
  - Utilize Clerk Dev’s authentication components to manage sign-up and sign-in flows.
  - Design a minimal, functional page using TailwindCSS, consistent with the app’s existing style.
  - Ensure responsiveness and accessibility across devices.

### 2. Backend Integration

- **Purpose:** Support user sign-up, authentication, and interaction with the app’s core features using Clerk Dev and NeonDB.
- **Description:**
  - **Authentication:** Manage user sign-up, sign-in, and sessions with Clerk Dev, including Google OAuth for calendar access.
  - **Database:** Introduce NeonDB for potential future use (e.g., storing user preferences or task metadata), though it will be minimally utilized initially.
- **Implementation Approach:**
  - Configure Clerk Dev with Google as a social connection, ensuring proper calendar access permissions.
  - Protect routes like `/app` and `/dashboard` while keeping `/` public.
  - Update existing API routes to use Clerk’s authentication methods instead of NextAuth’s.
  - Set up a NeonDB instance with a basic connection for future expandability.

### 3. Dashboard Page

- **Purpose:** Offer a simple page for users to view their account details.
- **Description:**
  - Displays basic information such as the user’s name and email, sourced from Clerk Dev.
- **Implementation Approach:**
  - Fetch and display user data using Clerk Dev’s provided tools.
  - Secure the route to ensure only authenticated users can access it.
  - Maintain design consistency with TailwindCSS.

### 4. Main App Interface Adjustment

- **Purpose:** Preserve the core task planning functionality while accommodating the new landing page.
- **Description:**
  - Relocate the existing main interface (task input and calendar view) from `/` to `/app`.
- **Implementation Approach:**
  - Update the interface to use Clerk Dev’s authentication methods instead of NextAuth’s.
  - Protect the `/app` route to restrict access to authenticated users.

## Technical Implementation Notes

- **Transition from NextAuth:**
  - Remove NextAuth dependencies and replace them with Clerk Dev’s authentication system.
- **Styling Consistency:**
  - Apply TailwindCSS across new pages (`/`, `/app`, `/dashboard`) to align with the existing design.
- **NeonDB Usage:**
  - Introduce NeonDB for future scalability, with minimal initial use.
- **Route Structure:**
  - `/`: Public landing page.
  - `/app`: Protected main app interface.
  - `/dashboard`: Protected user account page.
  - Update existing API routes to integrate with Clerk Dev.

## Assumptions and Considerations

- **Gemini Integration:** The current Gemini functionality remains unchanged.
- **Google Calendar Access:** Clerk Dev must be configured with appropriate permissions to maintain calendar integration.
- **Database Usage:** NeonDB is set up for potential future features, not extensive use in this phase.

## Conclusion

This PRD outlines the addition of onboarding and authentication enhancements to the Seri app, including a landing page, backend integration with Clerk Dev and NeonDB, and a user dashboard. These new features improve the user experience while building on the app’s existing foundation, ensuring simplicity and functionality remain at the core.

---
