# Task & Team Management Platform

A full-stack task and team management application built with the MERN stack. Features complete authentication, real-time dashboard analytics, full CRUD task management, an interactive Kanban board, and a polished responsive UI with dark mode support.

## Live Demo

| Layer | URL |
| --- | --- |
| **Frontend** | [https://task-team-management-platform.vercel.app/login](https://task-team-management-platform.vercel.app/login) |
| **Backend** | [https://task-team-management-platform.onrender.com](https://task-team-management-platform.onrender.com/) |
| **Database** | MongoDB Atlas (Cluster0) |

## Test Credentials

| Role   | Email                  | Password   |
| ------ | ---------------------- | ---------- |
| User   | testuser@example.com   | Test@1234  |
| Admin  | admin@example.com      | Admin@1234 |

## Tech Stack

| Layer      | Technologies                                             |
| ---------- | -------------------------------------------------------- |
| Frontend   | React, Vite, React Router, Redux Toolkit, Tailwind CSS, Axios, Recharts, Lucide React |
| Backend    | Node.js, Express                                         |
| Database   | MongoDB Atlas, Mongoose                                  |
| Deployment | Vercel (frontend), Render (backend)                      |

## Features

- JWT authentication with bcrypt password hashing
- Remember Me login persistence
- Role-based access (User / Admin)
- Dashboard with summary stat cards and interactive charts
- Full CRUD task management (Create, Read, Update, Delete)
- Search by title with debounced input
- Filter by status and priority
- Sort by date (newest / oldest / due date)
- Paginated task list
- Drag-and-drop Kanban board view
- Dark mode / Light mode toggle with localStorage persistence
- Toast notifications for all user actions
- Responsive design for mobile and desktop
- Protected routes with automatic redirect
- Graceful error handling (401, 404, 400, network errors)

## Folder Structure

```
client/src/
├── components/         Navbar, Sidebar, Layout, StatCard, TaskCard, TaskModal,
│                       TaskFilters, KanbanBoard, DashboardCharts, Pagination,
│                       Toast, ProtectedRoute
├── pages/              Login, Register, Dashboard, Tasks, NotFound
├── hooks/              useAuth, useDebounce, useTheme
├── services/           Axios API client with interceptors
├── store/              Redux Toolkit slices (auth, tasks, ui) and store config
└── utils/              Form validators, date formatters, status/priority configs

server/
├── config/             MongoDB Atlas connection
├── controllers/        authController, taskController, userController
├── middleware/          JWT auth guard, role authorization, error handlers
├── models/             User and Task Mongoose schemas
├── routes/             Auth, Task, and User route definitions
└── seed/               Database seeder for test accounts and sample tasks
```

## Local Setup

### Prerequisites

- Node.js v18+
- npm v9+
- A MongoDB Atlas account (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/task-management-platform.git
cd task-management-platform
```

### 2. Backend setup

```bash
cd server
npm install
```

Create a `.env` file in `server/` (see `.env.example`):

```env
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/task_manager?retryWrites=true&w=majority
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Seed the database with test accounts and sample tasks:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## API Documentation

All endpoints accept and return JSON. Protected routes require `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint      | Purpose                        | Auth Required |
| ------ | ------------- | ------------------------------ | ------------- |
| POST   | /register     | Create a new user account      | No            |
| POST   | /login        | Authenticate and receive JWT   | No            |
| GET    | /api/auth/me  | Get current user profile       | Yes           |

#### POST /register

Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

Response (201):
```json
{
  "success": true,
  "message": "Account registered successfully",
  "token": "eyJhbGci...",
  "user": {
    "id": "64f...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### POST /login

Request:
```json
{
  "email": "testuser@example.com",
  "password": "Test@1234",
  "rememberMe": true
}
```

Response (200):
```json
{
  "success": true,
  "message": "Logged in successfully",
  "token": "eyJhbGci...",
  "user": {
    "id": "64f...",
    "name": "Test User",
    "email": "testuser@example.com",
    "role": "user"
  }
}
```

### Tasks

| Method | Endpoint      | Purpose                        | Auth Required |
| ------ | ------------- | ------------------------------ | ------------- |
| GET    | /tasks        | Retrieve all tasks (paginated) | Yes           |
| GET    | /tasks/stats  | Get task statistics            | Yes           |
| GET    | /tasks/:id    | Retrieve a single task         | Yes           |
| POST   | /tasks        | Create a new task              | Yes           |
| PUT    | /tasks/:id    | Update an existing task        | Yes           |
| DELETE | /tasks/:id    | Delete a task                  | Yes           |

#### GET /tasks

Query parameters: `search`, `status`, `priority`, `sortBy`, `sortOrder`, `page`, `limit`

Response (200):
```json
{
  "success": true,
  "tasks": [...],
  "pagination": {
    "total": 8,
    "page": 1,
    "pages": 1,
    "limit": 8,
    "hasMore": false
  }
}
```

#### POST /tasks

Request:
```json
{
  "title": "Implement user dashboard",
  "description": "Build the main dashboard with stat cards",
  "priority": "high",
  "status": "pending",
  "dueDate": "2026-09-20",
  "assignedUser": "64f..."
}
```

Response (201):
```json
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "_id": "64f...",
    "title": "Implement user dashboard",
    "description": "Build the main dashboard with stat cards",
    "priority": "high",
    "status": "pending",
    "dueDate": "2026-09-20T00:00:00.000Z",
    "assignedUser": { "name": "Test User", "email": "testuser@example.com" },
    "createdBy": { "name": "Admin User", "email": "admin@example.com" }
  }
}
```

### Users

| Method | Endpoint | Purpose              | Auth Required |
| ------ | -------- | -------------------- | ------------- |
| GET    | /users   | List all users       | Yes           |

### Error Responses

| Code | Scenario               |
| ---- | ---------------------- |
| 400  | Invalid request data   |
| 401  | Unauthorized access    |
| 403  | Forbidden (role-based) |
| 404  | Resource not found     |
| 500  | Internal server error  |

## Bonus Features Implemented

1. **Dark Mode** — Full dark palette with localStorage persistence
2. **Toast Notifications** — Success, error, and info feedback on all actions
3. **Charts** — Recharts pie chart (status distribution) and bar chart (priority breakdown)
4. **Drag & Drop Kanban** — HTML5 drag-and-drop board with optimistic status updates
5. **Pagination** — Server-side pagination with page size controls

## Screenshots

_Add screenshots of the running application here._

## Deployment

### Frontend (Vercel)

1. Push the repo to GitHub
2. Import the repository in Vercel
3. Set root directory to `client`
4. Set build command to `npm run build`
5. Set output directory to `dist`
6. Add environment variable: `VITE_API_URL=https://task-team-management-platform.onrender.com`

### Backend (Render)

1. Create a new Web Service on Render
2. Connect to your GitHub repository
3. Set root directory to `server`
4. Set build command to `npm install`
5. Set start command to `npm start`
6. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `CLIENT_URL`, `NODE_ENV=production`

## License

MIT
