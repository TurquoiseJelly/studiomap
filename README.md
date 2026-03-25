# StudioMap

Interactive music gear knowledge base with clickable diagrams, step-by-step workflows, and full offline support. Explore your hardware through detailed documentation — no account, no cloud, everything runs locally in your browser.

## Features

- **Interactive Diagrams** — SVG-based gear diagrams with clickable hotspots that link to documentation sections. Touch-friendly with pinch-to-zoom and pan gestures on mobile.
- **Step-by-Step Workflows** — Guided walkthroughs for common tasks like building a beat, sampling, or setting up effects chains.
- **Full-Text Search** — Search across all gear packs, sections, workflows, shortcuts, and glossary terms.
- **Offline-First PWA** — Install as a Progressive Web App. All content is cached locally via IndexedDB and service workers — works without an internet connection.
- **Modular Gear Packs** — Each piece of gear is a self-contained module with its own manifest, diagrams, sections, workflows, quick references, and glossary.
- **Progress Tracking** — Mark sections as read, track workflow completion, and view mastery badges per gear.
- **Dark Mode** — Automatic light/dark theme based on system preferences, with manual toggle.

## Included Gear Packs

| Gear | Manufacturer | Category |
|------|-------------|----------|
| Circuit Tracks | Novation | Groovebox |
| EP-133 K.O. II | Teenage Engineering | Sampler |
| PO-33 K.O. | Teenage Engineering | Sampler |

## Tech Stack

- **React 19** + **TypeScript** (strict mode)
- **Vite** for dev server and builds
- **Tailwind CSS** for styling
- **Zustand** for state management
- **IndexedDB** (via `idb`) for persistent local storage
- **FlexSearch** for full-text search indexing
- **React Spring** + **@use-gesture** for animations and touch gestures
- **vite-plugin-pwa** for service worker and PWA manifest

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (included with Node.js)

### Installation

```bash
git clone https://github.com/your-username/studiomap.git
cd studiomap
npm install
```

### Development

```bash
npm run dev
```

Opens a dev server at `http://localhost:5173` with hot module replacement.

### Build

```bash
npm run build
```

Outputs a production build to `dist/`. The build includes TypeScript type checking and Vite bundling with PWA manifest and service worker generation.

### Preview

```bash
npm run preview
```

Serves the production build locally for testing.

### Linting & Formatting

```bash
npm run lint          # ESLint
npm run format        # Prettier (write)
npm run format:check  # Prettier (check only)
```

## Project Structure

```
studiomap/
├── public/
│   └── gear-packs/           # Static gear pack assets
│       ├── novation-circuit-tracks/
│       ├── te-ep133-ko2/
│       └── te-po33-ko/
├── src/
│   ├── components/
│   │   ├── gear/             # Diagram and section components
│   │   ├── layout/           # AppShell, Header, Sidebar
│   │   ├── search/           # Search bar
│   │   ├── settings/         # Storage settings
│   │   └── ui/               # Shared UI components
│   ├── contexts/             # React context providers
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # Route page components
│   │   └── gear/             # Gear detail sub-pages
│   ├── services/
│   │   ├── storage/          # IndexedDB adapters
│   │   └── sync/             # Offline sync queue
│   ├── stores/               # Zustand state stores
│   └── types/                # TypeScript type definitions
├── index.html
├── vite.config.ts
└── package.json
```

## Gear Pack Format

Each gear pack is a folder under `public/gear-packs/` containing:

```
gear-pack-id/
├── manifest.json             # Metadata, diagram hotspots, section/workflow index
├── diagram.svg               # Interactive SVG diagram
├── thumbnail.webp            # Thumbnail image for browsing
├── quick-reference.json      # Keyboard shortcuts and quick commands
├── glossary.json             # Terminology definitions
├── sections/                 # Documentation sections
│   ├── overview.json
│   ├── connections.json
│   └── ...
└── workflows/                # Step-by-step guides
    ├── first-beat.json
    └── ...
```

### Creating a New Gear Pack

1. Create a new folder under `public/gear-packs/` with a kebab-case ID (e.g., `korg-volca-keys`).
2. Add a `manifest.json` following the `GearPackManifest` type in `src/types/gear-pack.types.ts`. This defines metadata, diagram hotspot mappings, and indexes all sections and workflows.
3. Add an SVG diagram (`diagram.svg`) with element IDs matching the hotspot keys in your manifest.
4. Create section JSON files in `sections/` following the `Section` type — each section contains an array of `ContentBlock` items (headings, paragraphs, lists, tables, callouts, etc.).
5. Create workflow JSON files in `workflows/` following the `Workflow` type — each workflow has a list of steps with instructions, tips, and optional substeps.
6. Add `quick-reference.json` and `glossary.json` for shortcuts and terminology.
7. Register the gear pack in `src/services/gear-pack-loader.ts` in the `availableGearPacks` array.

## License

[MIT](LICENSE)
