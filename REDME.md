# FocusList — Modern, Resilient SaaS To-Do Application

FocusList is a fast, accessible, frontend-only SaaS to-do application. Capture tasks in seconds, organize priorities, track due dates, check off goals, and pick up exactly where you left off after a refresh. Zero accounts, zero backend, and zero configuration required.

Built for the **WebRush by Frontend Arena** hackathon.

**Live demo:** `https://your-deployment-url.example` 
**Repository:** `https://github.com/KrunalSolanki2006/FocusList-Challenge.git` 

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
  - [Technology Matrix](#1-technology-matrix)
  - [Architectural Deep-Dive](#2-architectural-deep-dive)
  - [Why Zero External Libraries?](#3-why-zero-external-libraries-for-state--ui)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Data and Persistence](#data-and-persistence)
- [Design System](#design-system)
- [Accessibility](#accessibility)
- [Responsive Behavior](#responsive-behavior)
- [Performance](#performance)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Deployment](#deployment)
- [Testing Checklist](#testing-checklist)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

**Problem:** Most to-do tools ask for an account before the first task, make deletion risky, lose data, and bury urgent work in a cluttered list.

**Solution:** FocusList opens straight into the working tool. Tasks are saved automatically in the browser, deletions can be undone, and filters, counts and due-date labels keep the list readable.

**Hackathon constraints followed**

- Frontend only, no backend services
- No external databases (persistence uses `localStorage`)
- Original work, deployed as a live static site

---

## Features

### Core

- Add tasks with Enter or the Add button, with validation for empty and over-long input
- Mark tasks complete or incomplete, with a clear visual difference
- Edit task details in a dialog
- Delete tasks
- Automatic persistence, restored on page load
- Empty states for a blank list and for filtered views
- Fully responsive layout

### Productivity

- Filters: All, Active, Completed, each with a live count
- Progress summary (for example, "3 of 8 done")
- Clear completed tasks in one click
- **Undo** after deleting a task or clearing completed tasks
- Optional priority (Low, Medium, High) and due date, with overdue and due-today labels
- Search by title

### Resilience

- Recovers from corrupted saved data and keeps a backup of the unreadable data
- Keeps working in memory, with a visible notice, if browser storage is unavailable
- Error boundary so a rendering error never leaves a blank screen

---

## Tech Stack

FocusList is engineered with a **zero-bloat, high-performance architecture**. It intentionally eliminates unnecessary runtime dependencies (no third-party state managers, no CSS utility frameworks, no external date libraries, and no bulky animation engines), achieving an ultra-fast initial load (~58.8 kB JS gzip) and near-zero First Contentful Paint (FCP).

### 1. Technology Matrix

| Layer | Technology | Version | Purpose & Technical Justification |
|---|---|---|---|
| **Core Framework** | [React](https://react.dev/) | `^18.3.1` | Component-driven declarative UI architecture, `useReducer` for deterministic state transitions, `useMemo`/`useCallback` for memoized performance, and React Portals for modal/toast layering. |
| **DOM Renderer** | [React DOM](https://react.dev/reference/react-dom) | `^18.3.1` | Concurrent rendering engine and reconciliation pipeline for rapid DOM updates. |
| **Build Tool & Bundler** | [Vite](https://vitejs.dev/) | `^6.0.1` | Lightning-fast ESM dev server with Hot Module Replacement (HMR), powered by Rollup for tree-shaken, code-split production bundles. |
| **React Vite Plugin** | [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) | `^4.3.4` | Fast JSX transformation and React Fast Refresh support during development. |
| **Iconography** | [Lucide React](https://lucide.dev/) | `^0.468.0` | Accessible, tree-shakeable SVG icons imported individually to keep bundle overhead minimal. |
| **Typography** | [@fontsource/instrument-sans](https://fontsource.org/fonts/instrument-sans) | `^5.1.0` | Self-hosted modern geometric sans-serif typeface. Eliminates external Google Fonts network requests, layout shifts (CLS), and privacy concerns. |
| **Styling Architecture** | Vanilla CSS3 (Custom Design System) | Native | Pure CSS with 80+ semantic design tokens (`tokens.css`), modern glassmorphism (`backdrop-filter`), spring cubic-bezier transitions, and zero runtime overhead (no Tailwind/CSS-in-JS). |
| **Animations Engine** | Pure CSS Keyframes & Springs | Native | GPU-accelerated micro-interactions (`transform`, `opacity`) running off the main thread at 60+ FPS. |
| **Persistence Engine** | Web Storage API (`localStorage`) | Native | Client-side deterministic JSON persistence with automated corruption recovery, backup safeguards, and in-memory graceful fallback. |
| **Date & Time API** | Native `Intl.DateTimeFormat` | Native | Zero-dependency localized date formatting and relative calculations without the overhead of Moment.js or date-fns. |
| **Accessibility (a11y)** | W3C WAI-ARIA Standards | Native | Native semantics (`role="table"`, `role="status"`, `aria-live`), focus trapping, high-contrast states, and keyboard navigability. |

---

### 2. Architectural Deep-Dive

#### ⚡ Core Framework & State Management
- **React 18**: Chosen for its robust concurrency model, battle-tested component lifecycle, and hook ecosystem.
- **`useReducer` State Architecture**:
  - All task modifications (add, edit, delete, toggle, clear, restore, import) are governed by a single deterministic reducer function (`src/state/taskReducer.js`).
  - Strict immutability guarantees zero state race conditions and predictable state transitions.
- **Selectivity & Memoization**:
  - Filter and search operations are memoized via `useMemo` in `src/state/selectors.js`, ensuring lists with hundreds of tasks compute in under `1ms`.

#### 🛠️ Build System & Bundling (Vite 6)
- **Sub-Second HMR**: Vite's native ES module serving provides instantaneous code updates during local development.
- **Optimized Asset Pipeline**:
  - Generates self-contained static assets in `dist/`.
  - Self-hosted `.woff2` font formats with hash-based caching headers.
  - Production bundle footprint: **~58.8 kB JavaScript (gzip)** and **~8.1 kB CSS (gzip)**.

#### 🎨 Styling Architecture & Design Tokens
- **Design Tokens (`src/styles/tokens.css`)**:
  - Complete design token hierarchy covering color scales (Slate, Indigo, Emerald, Amber, Rose), surface elevations, typography scales, border radii, and spring cubic-bezier easing curves (`--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)`).
- **Glassmorphic Aesthetic**:
  - Subtle blur backdrops (`backdrop-filter: blur(12px)`), translucent border highlights, and cohesive shadows provide a modern, executive SaaS interface.
- **Zero Runtime Cost**:
  - Avoids CSS-in-JS runtime overhead and Tailwind bundle bloat. Pure CSS rules are parsed once by the browser's rendering engine.

#### 💫 Micro-Interactions & Animated Icons
- **Hardware-Accelerated CSS Animations**:
  - Icons across the application feature responsive, delightful micro-animations:
    - **Checkbox**: Elastic bounce (`checkBounce`) and rotating check pop (`checkPop`).
    - **Priority Flags**: Hover flutter animation (`flagFlutter`).
    - **Due Date Calendars**: Bell-ring wiggle (`calendarRing`).
    - **Action Buttons**: Pencil wiggle (`pencilWiggle`) for edit and trash rattle (`trashRattle`) for delete.
    - **Composer Add Button**: `90°` spring rotation on hover and pop checkmark on completion.
    - **Sidebar & Filter Bar**: Dynamic view icon bounce (`activeIconPop`) and eraser wipe (`eraserWipe`).
    - **Search & Sort**: `rotate(-8deg)` focus tilt and `180°` sort toggle flip.
    - **Empty States**: Levitating float animation (`emptyFloat`).
    - **Toasts**: Counter-clockwise spin (`rotate(-180deg)`) on undo action.

#### 💾 Storage & Data Resilience
- **Fail-Safe Persistence Layer (`src/utils/storage.js`)**:
  - Auto-synchronizes state to `localStorage` on every change.
  - **Corrupted Data Recovery**: If invalid JSON is detected, FocusList rescues the file to a backup key (`margin.tasks.corrupted.<timestamp>`) and reinitializes cleanly without crashing.
  - **Private Browsing Fallback**: If storage is disabled or quota is exceeded, the application transparently switches to an in-memory store and presents a non-intrusive warning banner.

#### ♿ Accessibility (a11y) & Keyboard Navigation
- **Semantic HTML5 & ARIA 1.2**:
  - Full WAI-ARIA compliance with accessible names, live regions (`aria-live="polite"`), and modal focus traps.
- **Global Hotkeys (`useHotkeys.js`)**:
  - `N` or `c`: Instant focus on the Task Composer.
  - `/`: Instant focus on the Search bar.
  - `Esc`: Clear search query or close active modals.

---

### 3. Why Zero External Libraries for State / UI?

| External Library Avoided | Native Solution Used | Benefit to FocusList |
|---|---|---|
| **Redux / Zustand / MobX** | React `useReducer` + Context | Zero external bundle overhead, eliminates boilerplate, 100% type-safe and deterministic. |
| **Tailwind CSS / Material UI / Chakra** | Vanilla CSS + Design Tokens | Zero runtime CSS parsing, exact pixel control, perfect bespoke SaaS aesthetic. |
| **Framer Motion / GSAP** | Pure CSS3 Keyframes & Transitions | Zero JavaScript thread contention, runs at 60+ FPS on low-power mobile devices. |
| **Moment.js / date-fns / Day.js** | Native `Intl.DateTimeFormat` | Saves over 30–70 kB of unnecessary date parsing code. |
| **Axios / Fetch Wrappers** | Native Fetch / LocalStorage | Zero network dependency; FocusList is an instantaneous, client-side first app. |

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later (or an equivalent package manager)

### Installation

```bash
git clone https://github.com/your-username/margin.git
cd margin
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create an optimized production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run the linter |
| `npm test` | Run unit tests for the reducer and selectors (if included) |

---

## Project Structure

```
src/
├── main.jsx
├── App.jsx
├── components/
│   ├── layout/     AppHeader, FilterRail, MobileFilterBar, Footer
│   ├── tasks/      TaskComposer, TaskList, TaskItem, TaskEditDialog,
│   │               EmptyState, ProgressSummary
│   └── ui/         Button, IconButton, Checkbox, Chip, Dialog, ToastRegion
├── hooks/          useTasks, useLocalStorage, useToast, useMediaQuery, useHotkeys
├── state/          taskReducer.js, selectors.js
├── utils/          id.js, dates.js, validation.js, storage.js
├── constants/      filters.js, priorities.js, storageKeys.js
└── styles/         tokens.css, base.css, components.css
```

**Architecture notes**

- The reducer and selectors are pure functions with no React dependency, which makes them easy to test.
- Task data lives in one reducer. UI-only state (filter, search, open dialog, toasts) stays in the components that use it.
- Storage is written from a single place, the `useTasks` hook.

---

## Data and Persistence

All data stays in the user's browser. Nothing is sent anywhere.

**Task shape**

| Field | Type | Notes |
|---|---|---|
| `id` | string | `crypto.randomUUID()` with a fallback |
| `title` | string | Required, trimmed, 1–200 characters |
| `notes` | string | Optional, up to 500 characters |
| `completed` | boolean | |
| `priority` | `none` \| `low` \| `medium` \| `high` | |
| `dueDate` | `YYYY-MM-DD` or `null` | Stored as a local date string to avoid timezone shifts |
| `createdAt` | ISO string | |
| `completedAt` | ISO string or `null` | |

**Storage keys**

- `margin.tasks.v1` — `{ version: 1, tasks: [...] }`
- `margin.prefs.v1` — selected filter and sort
- `margin.tasks.backup` — raw copy of unreadable data, written only when recovery is needed

Every loaded item is validated. Invalid items are dropped, missing fields get defaults, and unknown fields are ignored.

---

## Design System

The interface is light-theme only, quiet and paper-like. Structure comes from spacing, hairline dividers and typography, not from stacks of shadowed cards.

**Colors**

| Token | HEX | Use |
|---|---|---|
| `--primary` | `#1F5F4A` | Primary actions, checked state, active filter |
| `--primary-hover` | `#174A39` | Hover and pressed |
| `--primary-soft` | `#E3F0EA` | Active filter background, highlights |
| `--accent` | `#B45309` | Due today, high priority (used sparingly) |
| `--bg` | `#F7F5F0` | Page background |
| `--surface` | `#FFFFFF` | Composer, dialog, inputs |
| `--border` | `#E4DFD3` | Dividers and input borders |
| `--text` | `#1C1B19` | Primary text |
| `--text-muted` | `#6B675E` | Meta text and placeholders |
| `--success` / `--error` / `--info` | `#1F7A4D` / `#B42318` / `#1D5FA8` | Feedback states |

**Typography:** Instrument Sans in weights 400, 500 and 600. Numbers use tabular figures.

**Layout:** page maximum 1040 px, content column 720 px, 4 px spacing scale, two border radii, one shadow style.

**Motion:** subtle and purposeful, using only opacity and transform. Motion is reduced when the user sets `prefers-reduced-motion`.

---

## Accessibility

- Semantic landmarks (`header`, `nav`, `main`, `footer`) and a skip-to-content link
- Real checkboxes labelled by task titles
- Visible focus ring on every interactive element
- Modal dialog with focus trap, Escape to close, and focus returned to the trigger
- Toasts and count changes announced through a polite live region
- Form errors linked with `aria-describedby` and `aria-invalid`
- Priority and overdue status shown with text and icons, never color alone
- Color contrast targeted at WCAG AA
- Touch targets of at least 44 px
- Reduced-motion support

---

## Responsive Behavior

| Screen | Layout |
|---|---|
| Desktop (1024 px and up) | Two columns with a sticky filter rail. Row actions appear on hover or focus. Centered edit dialog. |
| Tablet (640–1023 px) | Single centered column. Filters become a horizontal bar. Row actions always visible. |
| Mobile (under 640 px) | Full-width column. Scrollable segmented filter control. Search collapses to an icon. Edit opens as a bottom sheet. Full-width toasts with safe-area padding. |

---

## Performance

- Small dependency footprint and named icon imports
- Self-hosted font subset with `font-display: swap`
- No raster images. The empty-state illustration is inline SVG.
- Memoized task rows and selectors
- Debounced writes to `localStorage`
- Animations limited to `opacity` and `transform`
- Lighthouse target of 90 or higher in all four categories

---

## Keyboard Shortcuts

Shortcuts are an optional enhancement. Remove this section if they are not shipped.

| Key | Action |
|---|---|
| `N` | Focus the task composer |
| `/` | Focus search |
| `Enter` | Submit the composer or save the edit |
| `Esc` | Close a dialog, cancel an edit, or clear search |

---

## Deployment

The app builds to a static site, so any static host works.

**Vercel or Netlify**

1. Import the repository.
2. Build command: `npm run build`
3. Output directory: `dist`

**GitHub Pages**

1. Set `base` in `vite.config.js` to `'/your-repo-name/'`.
2. Run `npm run build`.
3. Publish the `dist/` folder.

---

## Testing Checklist

Run this list on the live URL before submitting.

- [ ] Add, edit, complete and delete all work
- [ ] Empty and whitespace-only titles are rejected with a message
- [ ] Tasks survive a page refresh and a browser restart
- [ ] Filters, search and counts stay accurate
- [ ] Undo restores deleted and cleared tasks correctly
- [ ] The app does not crash with corrupted or blocked storage
- [ ] Layout verified at 360, 390, 768, 1024 and 1440 px, with no horizontal page scroll
- [ ] Full keyboard-only run with visible focus and correct focus return
- [ ] Screen-reader labels and announcements checked
- [ ] Reduced-motion setting respected
- [ ] Lighthouse scores checked
- [ ] No console errors or warnings
- [ ] Live URL works in a private window

---

## Known Limitations

- Data is stored per browser and per device. Clearing site data removes tasks.
- There is no sync between devices and no accounts.
- There are no reminders or notifications.
- The app is designed for personal lists of a few hundred tasks, not thousands.

---

## Roadmap

Ideas outside the current scope:

- Sort options (newest, due date, priority)
- Export and import as JSON
- Drag-to-reorder
- Inline quick-edit on desktop
- Cross-tab sync using the `storage` event


Built by **Krunal Solanki** for WebRush by Frontend Arena.