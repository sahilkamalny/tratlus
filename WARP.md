# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Install & dev server
- Install dependencies (npm is assumed because `package-lock.json` is present):
  - `npm install`
- Run the dev server (Vite, port 3000, bound to `0.0.0.0`):
  - `npm run dev`
  - `npm run start` (alias)
  - The base path is `/` by default, or `/${TENANT_ID}/` when `TENANT_ID` is set in the environment.

### Build & preview
- Full production build (runs type/lint/format checks before bundling):
  - `npm run build`
  - This executes `npm run check:safe` (see below) and then `vite build`.
- Preview the production build locally:
  - `npm run serve`

### Type checking, linting, formatting
- Full check pipeline (type check + Radix-specific lint + format):
  - `npm run check`
  - This runs `tsgo --noEmit`, then `npm run lint:radix -- --fix`, then `npm run format`.
- "Safe" check with timeout wrapper (used by `build`):
  - `npm run check:safe`
  - This wraps `npm run check` with a `timeout 20` shell command; it assumes a POSIX-like shell is available.
- Radix UI usage validation (only files containing `<SelectItem`):
  - `npm run lint:radix`
  - Note: this script uses `grep` and `xargs`, so it also assumes a POSIX-like environment.
- Validate ESLint config files:
  - `npm run lint:validate`

### Tests (Vitest + React Testing Library)
- Run the whole test suite (non-watch mode):
  - `npm test`
- Run a specific test file:
  - `npx vitest src/components/AppTest.test.tsx`
- Run a specific test by name inside a file:
  - `npx vitest src/components/AppTest.test.tsx -t "should render text correctly"`

## Architecture overview

### Frontend stack & entrypoint
- The app is a single-page React application built with Vite and TypeScript.
- Entry is `src/main.tsx`:
  - Creates a `QueryClient` from `@tanstack/react-query` and wraps the app in `QueryClientProvider`.
  - Creates a TanStack Router instance via `createRouter` using the generated `routeTree` from `src/routeTree.gen.ts`.
  - Sets `basepath` to `/` or `/${TENANT_ID}` based on `import.meta.env.TENANT_ID`, so routing is tenant-aware.

### Routing and layout
- Routing is file-based via `@tanstack/react-router` and the Vite router plugin:
  - Routes live under `src/routes`. `__root.tsx` defines the root route; `index.tsx` defines the homepage route (`/`).
  - `TanStackRouterVite` is configured in `vite.config.js` (auto code splitting disabled at the moment).
- Root layout (`src/routes/__root.tsx`):
  - Wraps the app with `ThemeProvider` and `SoundProvider` contexts.
  - Renders an `ErrorBoundary` around the `Outlet`, with a flex column layout filling the viewport.

### Global UI state: theme and sound
- Theme:
  - `src/contexts/ThemeContext.tsx` exposes `useTheme` and `ThemeProvider`.
  - Manages a boolean `isDarkMode` flag and toggles `body` classes between `dark` and `light` for Tailwind.
- Sound effects:
  - `src/contexts/SoundContext.tsx` exposes `useSound` and `SoundProvider`.
  - Uses the Web Audio API to synthesize UI sounds (click, hover, success, etc.) with a simple internal synth.
  - Lazily initializes `AudioContext` on first user interaction and manages `isMuted` and `volume` in context.

### UI components and design system
- Shadcn/Radix-style component library under `src/components/ui/` (e.g., `button.tsx`, `card.tsx`, `dialog.tsx`, etc.) implements the app’s base visual language.
- Higher-level presentation components live under `src/components/`, for example:
  - `landing/LandingPage.tsx` renders the animated landing/marketing surface with theme and sound controls.
  - `ErrorBoundary.tsx`, `FloatingBanner.tsx`, etc., provide reusable UX wrappers.
- Tailwind CSS is enabled via `@tailwindcss/vite` in `vite.config.js`, with styles imported from `src/styles.css` in `main.tsx`.

### Core product flow: swipe-based preferences and itinerary builder
- The main experience is implemented in `src/routes/index.tsx` as the `/` route component:
  - Defines large, hardcoded `TRAVEL_CARDS` grouped into semantic categories (`Locations`, `Food`, `Activities`, `Accommodations`, `Transportation`, `Vibes`).
  - Maintains swipe state entirely in local React state (no backend persistence). A comment notes that ORM-based persistence was removed in favor of local-only tracking.
  - Tracks:
    - Which cards have been swiped (and in which direction) to build up `preferenceScores` over tags.
    - Per-category progress counts and completion (all categories require a minimum number of swipes).
    - App-level state transitions: `landing → loading → swiping → questionnaire → generating → itinerary`.
  - Provides swipe interaction via mouse/touch drag gestures, including animations, card stacks, and auto-completion of swipes.
- After swiping, the user fills out a multi-step questionnaire (dietary needs, budget, accommodation preferences, dates, etc.), and then an itinerary is generated.
- Itinerary view features (implemented in the latter half of `index.tsx`):
  - Day-by-day lists of activities, edit dialogs, drag-and-drop reordering, and the ability to add or refresh activities.
  - PDF export via `jspdf` and various UI affordances for editing and exploring the generated itinerary.

### AI integration: Google Gemini itinerary generation
- `src/hooks/use-google-gemini-chat.ts` encapsulates all Gemini-related logic and exposes `useGenerateItineraryMutation`:
  - Uses `@google/generative-ai` with `VITE_GEMINI_API_KEY` to create a `GoogleGenerativeAI` client.
  - Defines strongly typed `Activity`, `ItineraryDay`, `TravelItinerary`, and `GenerateItineraryResponse` interfaces.
  - Constructs a detailed system prompt that:
    - Requires the model to return **JSON only** in a specific schema.
    - Enforces realistic pricing and transport rules (especially for flights and `transport-between` activities).
  - Starts a chat session with a short “system conversation” history and sends the user-built prompt from the swipe + questionnaire state.
  - Post-processes the model output:
    - Strips Markdown/code fences if present and extracts a JSON object.
    - Parses the JSON and validates key invariants (destination, dates, day list, total cost), throwing explicit errors otherwise.
- The index route wires this hook via `useGenerateItineraryMutation`, builds the textual prompt out of swipes and questionnaire answers, and transitions into the itinerary UI once a valid response is parsed.

### Linting configuration
- Main ESLint entrypoint is `eslint.config.js`, which re-exports the configuration from `config/eslint/index.js`.
- `config/eslint/index.js`:
  - Exposes `baseConfig` and `radixConfig` for different linting contexts.
  - Default export combines base config with a custom `radix-custom` plugin that enforces `radix-custom/no-empty-select-item` on all `*.ts/tsx` files.
- There is a dedicated entry-point config in `config/eslint/eslint.radix.config.js` (used by the `lint:radix` script).

### Testing setup
- `src/components/AppTest.test.tsx` provides a minimal Vitest + React Testing Library smoke test:
  - Imports `@testing-library/react` and `@testing-library/jest-dom` and verifies basic rendering.
- Vitest is configured via the `test` field in `vite.config.js` (globals enabled, `jsdom` environment).
- New tests can follow the same pattern with `*.test.ts`/`*.test.tsx` files colocated near the components they cover.

### Other notable structure
- `REFERENCE/App.jsx` is a large reference implementation that appears to predate the current modularized structure. It shows earlier inline implementations of theme, sound, landing page, and itinerary UI; use it as historical context rather than as the source of truth for new work.
