# Event Layout Planner

A modern, AI-powered event layout planning application built with Next.js 15, featuring drag-and-drop functionality and intelligent layout suggestions powered by OpenAI.

## Features

- **AI-Powered Layout Suggestions**: Get intelligent event layout recommendations based on event type, capacity, and venue
- **Interactive Drag-and-Drop Canvas**: Easily design event layouts with an intuitive drag-and-drop interface
- **Multiple Element Types**: Stage, tables, chairs, booths, entrances, exits, restrooms, bars, and registration desks
- **Real-time Editing**: Edit, resize, rotate, and position elements in real-time
- **User Authentication**: Secure authentication system with NextAuth.js
- **Database Persistence**: All layouts and events are saved to PostgreSQL
- **Responsive Design**: Works seamlessly across desktop and tablet devices

## Tech Stack

### Frontend
- **Next.js 15** (App Router) - React framework with server components
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Zustand** - Lightweight state management
- **Lucide React** - Beautiful icons
- **date-fns** - Date formatting

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma 7** - Type-safe database ORM
- **PostgreSQL** - Reliable relational database
- **NextAuth.js 5** - Authentication
- **bcryptjs** - Password hashing

### AI Integration
- **OpenAI GPT-4** - Intelligent layout generation
- **OpenAI SDK** - Latest OpenAI API client

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- pnpm (recommended) or npm
- PostgreSQL database (local or cloud)

### Installation

1. **Install dependencies**

```bash
pnpm install
```

2. **Set up environment variables**

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update the following in `.env`:

```env
# Database - Update with your PostgreSQL connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/event_planner?schema=public"

# NextAuth - Generate a random secret (use: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI - Add your OpenAI API key
OPENAI_API_KEY="sk-your-openai-api-key-here"
```

3. **Set up the database**

Run Prisma migrations to create the database schema:

```bash
pnpm exec prisma migrate dev --name init
```

This will:
- Create the database if it doesn't exist
- Run all migrations
- Generate the Prisma Client

4. **Start the development server**

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Database Setup

### Option 1: Local PostgreSQL

Install PostgreSQL locally and create a database:

```bash
createdb event_planner
```

Update `DATABASE_URL` in `.env` with your local connection string.

### Option 2: Cloud Database (Recommended for Production)

Use a cloud PostgreSQL provider like:
- [Supabase](https://supabase.com) (Free tier available)
- [Neon](https://neon.tech) (Free tier available)
- [Railway](https://railway.app)
- [Vercel Postgres](https://vercel.com/storage/postgres)

Update `DATABASE_URL` with the connection string from your provider.

## Usage

### 1. Create an Account

- Navigate to [http://localhost:3000/auth/signup](http://localhost:3000/auth/signup)
- Register with your email and password

### 2. Create an Event

- Click "New Event" on the dashboard
- Fill in event details:
  - Title (required)
  - Description
  - Event date (required)
  - Event type (conference, wedding, concert, etc.)
  - Venue
  - Capacity
  - Start and end times

### 3. Design Your Layout

- Drag elements from the left toolbar onto the canvas
- Click and drag to reposition elements
- Click an element to select it
- Use the resize handle (bottom-right corner) to resize
- Delete selected elements with the × button

### 4. Use AI Suggestions

- Click "Generate Layout" in the AI Assistant panel
- The AI will analyze your event details and suggest an optimal layout
- Review the suggestion and reasoning
- Click "Apply This Layout" to use it
- You can still manually adjust after applying

### 5. Save Your Layout

- Click "Save Layout" in the top-right corner
- All elements are saved to the database
- Return anytime to edit

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints (signin, signout, etc.)

### Events
- `GET /api/events` - Get all events for authenticated user
- `POST /api/events` - Create new event
- `GET /api/events/[id]` - Get event details
- `PATCH /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event

### Elements
- `POST /api/events/[id]/elements` - Create element
- `PATCH /api/events/[id]/elements` - Update element
- `DELETE /api/events/[id]/elements?elementId=x` - Delete element

### AI Suggestions
- `POST /api/layouts/suggest` - Generate AI layout suggestion

## Project Structure

```
event-layout-planner/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── events/       # Event CRUD endpoints
│   │   └── layouts/      # AI suggestion endpoint
│   ├── auth/             # Auth pages (signin, signup)
│   ├── dashboard/        # Dashboard page
│   ├── events/[id]/      # Event editor page
│   └── page.tsx          # Root redirect
├── components/
│   └── canvas/           # Canvas components
│       ├── EventCanvas.tsx
│       ├── CanvasElement.tsx
│       ├── ElementToolbar.tsx
│       └── AISuggestionPanel.tsx
├── lib/
│   ├── prisma.ts         # Prisma client
│   ├── openai.ts         # OpenAI integration
│   ├── store.ts          # Zustand state management
│   └── utils.ts          # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema
├── types/
│   └── next-auth.d.ts    # TypeScript definitions
├── .env                  # Environment variables
├── auth.ts               # NextAuth configuration
└── middleware.ts         # Auth middleware
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Random secret for NextAuth | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI features | Yes |

## Development

### Run Prisma Studio (Database GUI)

```bash
pnpm exec prisma studio
```

### Generate Prisma Client after schema changes

```bash
pnpm exec prisma generate
```

### Create a new migration

```bash
pnpm exec prisma migrate dev --name your_migration_name
```

### Reset database

```bash
pnpm exec prisma migrate reset
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Railway
- Render
- AWS Amplify
- DigitalOcean App Platform

## Troubleshooting

### Database connection errors

- Verify PostgreSQL is running
- Check `DATABASE_URL` is correct
- Ensure database exists

### OpenAI API errors

- Verify `OPENAI_API_KEY` is set
- Check you have credits in your OpenAI account
- Ensure you're using a valid API key

### Authentication issues

- Regenerate `NEXTAUTH_SECRET`
- Clear browser cookies
- Check `NEXTAUTH_URL` matches your domain

## License

MIT License
