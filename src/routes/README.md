# Travel Planner

AI-assisted travel planning web app built with React, Vite (Rolldown), and TypeScript. This app lets users swipe through rich travel preference cards, answer a short questionnaire, and generate an editable, AI-powered itinerary.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Dev Server](#running-the-dev-server)
- [Available npm Scripts](#available-npm-scripts)
- [Environment Configuration](#environment-configuration)
- [Architecture Overview](#architecture-overview)
  - [Routing & Application Shell](#routing--application-shell)
  - [Theming & Sound](#theming--sound)
  - [AI Itinerary Generation](#ai-itinerary-generation)
- [Testing](#testing)
- [Linting & Formatting](#linting--formatting)
- [Building & Deployment](#building--deployment)

---

## Features

- **Swipe-based preference capture**
  - Large curated catalog of cards across categories: locations, food, activities, accommodations, transportation, and vibes.
  - Tinder-style swipe interactions (left/right) with drag gestures, animations, and per-category completion goals.
  - Auto-complete mode to quickly satisfy minimum swipe counts for all categories.

- **Rich questionnaire flow**
  - Captures dietary needs, food allergies, budgets, dates, accommodation preferences, transportation priorities, wake/sleep times, and more.
  - All answers are combined with swipe-based tag scores to form a detailed prompt for itinerary generation.

- **AI-powered itinerary generation**
  - Uses Google Gemini via `@google/generative-ai` to generate a structured `TravelItinerary` JSON object.
  - Enforces a schema with days, activities, cost estimates, and inter-activity “transport-between” segments.
  - Enforces realistic flight pricing guidelines and economy-class defaults unless otherwise requested.

- **Editable itinerary experience**
  - Day-by-day view with activities organized by time.
  - Supports deleting activities, refreshing a single activity via AI, reordering, and computing updated total cost on the client.

- **Polished UX**
  - Landing page with animated branding (`TRATLUS`), theme toggle, and sound design.
  - Global light / dark support via Tailwind and a `ThemeProvider`.
  - Web Audio–based sound effects for interactions (clicks, success, hover, etc.).
  - Error boundary overlay for graceful failure handling.

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Bundler**: [Vite](https://vitejs.dev/) (using Rolldown)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), custom components in `src/components/ui`
- **Routing**: [TanStack Router](https://tanstack.com/router/)
- **Data Fetching & Caching**: [TanStack Query](https://tanstack.com/query/latest)
- **AI API**: [Google Generative AI (Gemini)](https://ai.google.dev/)
- **Testing**: [Vitest](https://vitest.dev/), [Testing Library](https://testing-library.com/) for DOM/React
- **Linting & Formatting**: [Biome](https://biomejs.dev/), [ESLint](https://eslint.org/)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **v18+**
- [npm](https://www.npmjs.com/) (ships with Node)

### Installation

Clone the repository and install dependencies:

```sh
npm install
```

### Running the Dev Server

Start the Vite dev server (default: http://localhost:3000):

```sh
npm run dev
```

or equivalently:

```sh
npm start
```

---

## Available npm Scripts

All commands are run from the project root.

- **Development**
  - `npm run dev` – Start the Vite dev server on port 3000.
  - `npm start` – Alias for `npm run dev`.

- **Build & Preview**
  - `npm run build` – Run `check:safe` (typecheck + lint/format with timeout guard) and then produce a production build into `dist/`.
  - `npm run serve` – Preview the production build locally via `vite preview`.

- **Quality & Tooling**
  - `npm run check` – Run TypeScript (via `tsgo --noEmit`), Radix-specific linting (`lint:radix`), and formatting (`format`).
  - `npm run check:safe` – Run `npm run check` with a 20-second timeout; used by `build` to prevent very long pre-checks.
  - `npm run format` – Format the codebase with Biome (`biome check --write --unsafe`).
  - `npm run format:quiet` – Same as `format` with reduced log noise.
  - `npm run lint:radix` – Find files using `<SelectItem` and run ESLint with `config/eslint/eslint.radix.config.js` on them.
  - `npm run lint:validate` – Validate ESLint config files via `config/eslint/validate-configs.js`.

- **Testing**
  - `npm run test` – Run the Vitest test suite in `run` mode.

Examples:

- Run a **single test file**:

  ```sh
  npm run test -- src/components/AppTest.test.tsx
  ```

- Run **tests matching a name**:

  ```sh
  npm run test -- -t "renders landing page"
  ```

> Note: `lint:radix` relies on shell tools like `grep` and `xargs`; make sure they are available in your environment.

---

## Environment Configuration

The app expects several environment variables (typically configured via `.env` or your hosting platform):

- `VITE_GEMINI_API_KEY` – API key for Google Gemini. Required for itinerary generation.
- `TENANT_ID` (optional) – If set, used as the base path for routing (router `basepath` is `/${TENANT_ID}` instead of `/`).

Example `.env` snippet:

```sh
VITE_GEMINI_API_KEY=your-gemini-api-key
TENANT_ID=my-tenant
```

---

## Architecture Overview

### Routing & Application Shell

- **Entry Point**: `src/main.tsx`
  - Creates a `QueryClient` with sensible defaults (5-minute `staleTime`, 10-minute `gcTime`, single retry, no refetch on window focus).
  - Builds a TanStack Router instance using the generated route tree from `src/routeTree.gen.ts`.
  - Sets `basepath` dynamically from `import.meta.env.TENANT_ID` when present.
  - Renders the app into the `#app` element, wrapped with:
    - `StrictMode`
    - `QueryClientProvider`
    - `RouterProvider`

- **Root Route**: `src/routes/__root.tsx`
  - Declares the root route via `createRootRoute`.
  - Wraps all route children in:
    - `ThemeProvider` (`src/contexts/ThemeContext.tsx`)
    - `SoundProvider` (`src/contexts/SoundContext.tsx`)
    - `ErrorBoundary` (`src/components/ErrorBoundary.tsx`), which overlays an error UI while preserving the previous DOM snapshot.

- **Main Experience Route**: `src/routes/index.tsx`
  - Houses most of the app logic:
    - Swipe card deck powered by a large `TRAVEL_CARDS` constant with rich tags.
    - `AppState` state machine (`"landing"`, `"loading"`, `"swiping"`, `"questionnaire"`, `"generating"`, `"itinerary"`).
    - Local preference model built from swipe decisions and questionnaire responses.
    - Integration with the Gemini hook `useGenerateItineraryMutation`.
    - Local-only editing of the returned `TravelItinerary` (no persistence by default).

### Theming & Sound

- **`src/contexts/ThemeContext.tsx`**
  - Provides `isDarkMode` and `toggleTheme` via React context.
  - Toggles `dark` / `light` classes on `document.body` to drive Tailwind-based themes.

- **`src/contexts/SoundContext.tsx`**
  - Lazily creates a `window.AudioContext` after the first user interaction.
  - Exposes `playSound(type)`, `isMuted`, and `volume`.
  - Implements several tone profiles (click, cancel, hover, pop, plop, switch, success) using oscillators and gain nodes.

- **Landing Page**: `src/components/landing/LandingPage.tsx`
  - Animated full-screen marketing splash with:
    - The app logo.
    - Tagline and feature pills.
    - Theme toggle (`ThemeToggle` from `src/components/ui/ThemeToggle.tsx`).
    - Persistent sound controls (mute + volume slider).
    - `onStart` callback that kicks off the swipe flow.

### AI Itinerary Generation

- **Hook**: `src/hooks/use-google-gemini-chat.ts`
  - Defines types: `Activity`, `ItineraryDay`, `TravelItinerary`, and `GenerateItineraryResponse`.
  - Builds a detailed **system prompt** that:
    - Forces **JSON-only** responses with a strict schema.
    - Enforces:
      - Economy-class, realistic round-trip flight costs.
      - `transport-between` activities between main activities.
      - Menu highlights for food activities.
  - Uses `GoogleGenerativeAI` and `model.startChat` with predefined history.
  - Parses Gemini’s text output, stripping code fences and extracting the JSON payload.
  - Validates the resulting itinerary before returning it.

- **Usage in `index.tsx`**
  - The route builds a user-specific prompt from:
    - Swipe-derived `preferenceScores` (tags and scores).
    - Questionnaire answers (budget, dates, destination, dietary constraints, etc.).
  - Calls `generateItinerary` and, on success, stores `itinerary` in component state and transitions to the `"itinerary"` UI.
  - Supports refreshing a **single activity** by issuing a specialized prompt targeting that time slot and then patching the itinerary.


---

## Testing

Run the test suite:

```sh
npm run test
```

Additional notes:

- Tests are written with **Vitest** and **Testing Library** (`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/dom`).
- A sample test lives in `src/components/AppTest.test.tsx` and can be used as a template for new tests.

---

## Linting & Formatting

This project uses **Biome** for formatting and **ESLint** for linting.

- Format the codebase in-place:

  ```sh
  npm run format
  ```

- Run full checks (typecheck + lint + format):

  ```sh
  npm run check
  ```

- Validate ESLint configuration only:

  ```sh
  npm run lint:validate
  ```

Specialized configs exist for Radix UI usage (`lint:radix`).

---

## Building & Deployment

Create a production build:

```sh
npm run build
```

- Output is written to the `dist/` directory.
- The build is a standard Vite SPA bundle and can be served by any static host (e.g., Nginx, Vercel, Netlify, S3 + CloudFront).

Local preview of the production build:

```sh
npm run serve
```