# FocusList — Modern, High-Performance SaaS Task Management

> A lightning-fast, accessible, local-first SaaS to-do application designed for seamless task capture, tabular organization, bulk operations, and resilient browser-native persistence.

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Vitest-53%20Passing-4E9A06?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## 🚀 Features

- **⚡ Lightning-Fast Capture**: Create tasks in seconds with keyboard shortcuts (`N` or `c`), instant validation, and due date shortcuts (`Today`, `Tomorrow`).
- **📋 Structured Table Layout**: Modern, clean, tabular UI with numbered rows, priority badges, due date status tags, notes previews, and actions.
- **☑️ Multi-Select & Bulk Operations**: Checkbox-based selection with indeterminate header control, live selected count badge, bulk completion, and bulk deletion with one-click Undo.
- **🔄 Unified Undo Architecture**: Non-destructive deletions and batch operations with a 6-second accessible countdown toast notification.
- **🎯 Productivity Quick Views**: Real-time derived views with live count badges:
  - `All`, `Active`, `Completed`
  - `Due Today`, `Upcoming`, `Overdue`
- **🔀 Deterministic Multi-Tier Sorting**: Sort tasks by `Newest`, `Oldest`, `Due Date`, and `Priority` with stable tie-breaking and automatic localStorage preference persistence.
- **🔍 Instant Search with A11y Feedback**: Search across task titles and notes simultaneously with keyboard focus (`/`), quick clear (`×`), and `aria-live` screen-reader match announcements.
- **💾 Secure JSON Backup & Restore**:
  - Export tasks stamped with schema version (`margin.tasks.v1`) and timestamp.
  - Import modal with 2MB safety boundary, 1,000-task cap, schema validation, live preview, and Merge/Replace options.
- **🔁 Native Cross-Tab Synchronization**: Real-time sync across multiple open browser tabs using the native window `storage` event without page reload.
- **🛡️ Resilient Local-First Storage**: Automatic migration for legacy formats, corrupt JSON isolation into `margin.tasks.backup`, and in-memory fallback.
- **♿ WCAG 2.1 AA Accessibility**: Full keyboard navigation, focus trap/restoration on modals, ARIA live regions, minimum 44px touch targets, and `@media (prefers-reduced-motion)` support.
- **📱 Fully Responsive**: Fluid layouts engineered for desktop, tablet, and mobile with dedicated mobile bottom sheets and segmented filter bars.

---

## 📂 Project Structure

```text
Frontend/
├── index.html                      # HTML entry point with metadata & SEO tags
├── package.json                    # Dependencies and scripts (React, Vite, Vitest)
├── vite.config.js                  # Vite bundler configuration
├── src/
│   ├── main.jsx                    # Application bootstrapping
│   ├── App.jsx                     # Root application container & state orchestration
│   ├── __tests__/                  # 53 Automated unit & integration tests
│   │   ├── importExport.test.js    # JSON export/import security & boundary tests
│   │   ├── selectors.test.js       # Filtering, search, and deterministic sorting tests
│   │   ├── storage.test.js         # LocalStorage, corruption recovery, and migration tests
│   │   ├── taskReducer.test.js     # State reducer transitions & undo tests
│   │   └── validation.test.js      # Input validation & edge-case coercion tests
│   ├── components/
│   │   ├── layout/                 # AppHeader, Sidebar, MobileFilterBar, Footer
│   │   ├── tasks/                  # TaskComposer, TaskList, TaskItem, BulkActionBar,
│   │   │                           # TaskEditDialog, ImportExportDialog, StorageBanner
│   │   └── ui/                     # Button, IconButton, Checkbox, Dialog, Toast, ToastRegion
│   ├── hooks/                      # useTasks, useLocalStorage, useToast, useMediaQuery, useHotkeys
│   ├── state/                      # taskReducer.js (state machine), selectors.js (pure derived state)
│   ├── utils/                      # dates.js, id.js, importExport.js, migration.js, storage.js, validation.js
│   ├── constants/                  # filters.js, priorities.js, storageKeys.js
│   └── styles/                     # tokens.css (design tokens), base.css, components.css
```

---

## ⚙️ Installation

### Prerequisites
- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher (or `pnpm` / `yarn`)

### Step-by-Step Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/KrunalSolanki2006/FocusList-Challenge.git
   cd FocusList-Challenge/Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:3000` (or the port displayed in your terminal).

---

## ▶️ Usage

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite local development server with Hot Module Replacement (HMR). |
| `npm test` | Runs the automated **Vitest** test suite (53 tests across 5 test suites). |
| `npm run build` | Compiles an optimized, tree-shaken production bundle into `dist/`. |
| `npm run preview` | Locally serves the production build for verification. |

### Keyboard Shortcuts

| Key | Action |
|---|---|
| <kbd>N</kbd> or <kbd>C</kbd> | Jump focus to the Task Composer input |
| <kbd>/</kbd> | Jump focus to the Search input |
| <kbd>Esc</kbd> | Clear active task selection $\rightarrow$ Clear search query $\rightarrow$ Dismiss open modal |
| <kbd>Enter</kbd> | Submit task composer or save active edit dialog |

---

## 🛠️ Tech Stack

- **Core & Runtime**: [React 18](https://react.dev/) — Declarative UI with Concurrent Mode support.
- **Build Tooling**: [Vite 6](https://vitejs.dev/) — Sub-second HMR and optimized Rollup bundling.
- **State Architecture**: Pure `useReducer` state machine + Custom Hooks (`useTasks`, `useLocalStorage`).
- **Styling Architecture**: Vanilla CSS with CSS Custom Properties (Design Tokens) — zero runtime CSS-in-JS overhead.
- **Iconography**: [Lucide React](https://lucide.dev/) — Clean, accessible SVG icons.
- **Testing Layer**: [Vitest](https://vitest.dev/) — Ultra-fast ESM-native test runner.
- **Version Control**: Git & [GitHub](https://github.com/)

---

## 📸 Screenshots

| Desktop Table View | Multi-Select & Bulk Actions |
|:---:|:---:|
| ![Desktop View](https://via.placeholder.com/600x340?text=FocusList+Desktop+Table+View) | ![Bulk Actions](https://via.placeholder.com/600x340?text=FocusList+Bulk+Action+Bar) |

| Secure Backup & Restore | Mobile Responsive Layout |
|:---:|:---:|
| ![Backup & Restore](https://via.placeholder.com/600x340?text=FocusList+JSON+Import+Export) | ![Mobile View](https://via.placeholder.com/300x500?text=FocusList+Mobile+UI) |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. **Fork the project** (`https://github.com/KrunalSolanki2006/FocusList-Challenge/fork`)
2. **Create your feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes:**
   ```bash
   git commit -m "feat: add amazing new feature"
   ```
4. **Push to the branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

Built by **Krunal Solanki** for **WebRush by Frontend Arena**.
