# Task Manager

A modern, full-stack task management application built with React and Node.js.

## Features

- 🔐 **User Authentication** - Secure register/login with JWT
- 📁 **Projects** - Organize tasks into projects
- ✅ **Tasks** - Create, edit, complete, and delete tasks
- 🎯 **Priorities** - Set task priorities (Low, Medium, High)
- 📊 **Status Tracking** - Track task progress (Todo, In Progress, Done)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | SQLite + Prisma ORM |
| Auth | JWT + bcrypt |

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
# Install all dependencies
npm install

# Setup database
npm run db:migrate

# Start development servers
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## Project Structure

```
├── backend/           # Express API server
│   ├── prisma/        # Database schema and migrations
│   └── src/
│       ├── routes/    # API route handlers
│       ├── services/  # Business logic
│       ├── middleware/# Auth, error handling
│       └── utils/     # Helper functions
│
├── frontend/          # React application
│   └── src/
│       ├── api/       # API client
│       ├── components/# Reusable UI components
│       ├── pages/     # Page components
│       ├── context/   # React context providers
│       └── hooks/     # Custom React hooks
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/projects/:projectId/tasks` - List project tasks
- `POST /api/projects/:projectId/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Development

```bash
# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend

# Run tests
npm test
```

## License

MIT
