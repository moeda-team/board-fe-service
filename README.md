# ChronoTask

Project management board application — manage spaces, tasks, members, and track developer KPIs.

## Features

- **Dashboard** — overview of your workspaces
- **Spaces** — project boards with drag-and-drop task management
- **Members** — team member management
- **Role & Access** — permission control
- **Developers KPI** — performance tracking
- **Real-time updates** — Socket.io for live collaboration

## Tech Stack

- **Framework:** Next.js 16.2.4 + React 19.2.4
- **Auth:** NextAuth.js v4 (JWT-based)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Data fetching:** TanStack Query v5
- **Icons:** Lucide React + Phosphor Icons
- **State:** React hooks + context providers
- **Real-time:** Socket.io client

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (package manager)

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
AUTH_SECRET=your-auth-secret-here
```

### Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
pnpm build
pnpm start
```

## Project Structure

```text
app/
├── dashboard/          # Dashboard page
├── spaces/             # Workspace/board management
├── members/            # Team members
├── role-access/        # Permissions & roles
├── developers-kpi/     # KPI tracking
├── login/              # Auth page
├── api/                # API routes
├── components/         # Page components
└── lib/                # Utilities

components/             # Shared UI components (shadcn/ui)
hooks/                  # Custom React hooks
providers/              # Context providers
lib/                    # Utilities & services
types/                  # TypeScript types
```

## Scripts

| Command      | Description                   |
| ------------ | ----------------------------- |
| `pnpm dev`   | Start dev server with webpack |
| `pnpm build` | Production build              |
| `pnpm start` | Start production server       |
| `pnpm lint`  | Run ESLint                    |

## License

Private — internal use only.
