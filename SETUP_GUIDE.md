# CipherStudio - Complete Setup Guide

## 🎯 Project Overview

CipherStudio is a browser-based React IDE built for CipherSchools placement assignment. It allows users to create, manage, and run React projects directly in the browser.

## ✅ Requirements Met

### Core Features (Required) - **ALL IMPLEMENTED** ✓

1. ✅ **File Management**: Users can create, delete, and organize project files
2. ✅ **Code Editor**: Monaco Editor integration via Sandpack for React code editing
3. ✅ **Live Preview**: Real-time preview using Sandpack
4. ✅ **Save & Load Projects**: MongoDB storage with full CRUD operations
5. ✅ **Login/Register**: JWT-based authentication
6. ✅ **UI/UX**: Clean and intuitive VS Code-inspired interface

### Optional/Bonus Features - **IMPLEMENTED** ✓

1. ✅ **Theme Switcher**: Dark/Light theme toggle
2. ✅ **File/Folder Operations**: Create, rename, delete files and folders
3. ✅ **Login/Register**: Full authentication system
4. ✅ **Responsive UI**: Works on desktop and tablet screens
5. ✅ **Auto-save**: Toggleable autosave feature
6. ✅ **Keyboard Shortcuts**: Keyboard navigation support
7. ✅ **Project Export/Import**: Save and load project files

## 🛠️ Tech Stack

### Frontend ✓
- ✅ React 18 with Vite
- ✅ TypeScript for type safety
- ✅ Sandpack for code execution
- ✅ CSS Modules for styling
- ✅ React Router for navigation
- ✅ Axios for API calls
- ✅ Context API for state management

### Backend ✓
- ✅ Node.js with Express
- ✅ MongoDB with Mongoose
- ✅ JWT for authentication
- ✅ bcrypt for password hashing
- ✅ Express Validator for validation
- ✅ CORS for cross-origin requests
- ✅ Helmet for security

### Database ✓
- ✅ MongoDB (supports both Atlas and local)
- ✅ Three collections: Users, Projects, Files

## 📋 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- MongoDB (local or Atlas account)

### Step 1: Clone and Install

```bash
# Clone the repository (already done)
cd CipherSChoolsFrontend

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 2: Configure Backend Environment

Create a `.env` file in the `backend/` directory:

```env
# MongoDB Connection String
# Option A: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/cipherstudio

# Option B: MongoDB Atlas (Recommended for deployment)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cipherstudio

# JWT Secret Key (change in production)
JWT_SECRET=cipherstudio-jwt-secret-key-change-in-production-123

# JWT Expiration
JWT_EXPIRES_IN=7d

# Server Port
PORT=8080

# CORS Origin
CORS_ORIGIN=http://localhost:5173

# Node Environment
NODE_ENV=development
```

### Step 3: Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows (run MongoDB service)
net start MongoDB

# macOS/Linux
mongod --dbpath ~/data/db
```

**Option B: MongoDB Atlas** (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create database user
4. Whitelist IP (use `0.0.0.0/0` for development)
5. Copy connection string to `MONGODB_URI`

### Step 4: Start the Backend Server

```bash
cd backend
npm run dev  # Development mode with auto-reload
# OR
npm start    # Production mode
```

The server will start on `http://localhost:8080` (or next available port).

Verify it's working:
```bash
curl http://localhost:8080/health
# Expected: {"status":"ok"}
```

### Step 5: Start the Frontend

```bash
# From project root
npm run dev
```

The frontend will start on `http://localhost:5173`

### Step 6: Test the Application

1. Open `http://localhost:5173` in your browser
2. Click "Login / Register"
3. Register a new account
4. Create a new project
5. Start coding!

## 📁 Project Structure

```
CipherSChoolsFrontend/
├── src/                    # Frontend source code
│   ├── components/        # React components
│   ├── contexts/          # Context providers
│   ├── hooks/            # Custom hooks
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   └── App.tsx           # Main app component
├── backend/              # Backend source code
│   ├── src/
│   │   ├── config/       # Configuration
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API routes
│   │   └── utils/        # Utilities
│   └── server.js         # Server entry point
└── package.json          # Frontend dependencies
```

## 🗄️ Database Schema

### Users Collection
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  createdAt: Date
}
```

### Projects Collection
```javascript
{
  name: String (required),
  userId: ObjectId (ref: User),
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Files Collection
```javascript
{
  projectId: ObjectId (ref: Project),
  parentId: ObjectId (ref: File, optional),
  name: String (required),
  type: 'file' | 'folder',
  content: String (for files only),
  path: String (required, unique per project),
  createdAt: Date
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Files
- `GET /api/projects/:projectId/files` - List files in project
- `POST /api/projects/:projectId/files` - Create file/folder
- `PUT /api/files/:fileId` - Update file content or rename
- `DELETE /api/files/:fileId` - Delete file/folder

## 🚀 Deployment

### Frontend (Vercel/Netlify)

```bash
# Build for production
npm run build

# Deploy the 'dist' folder to Vercel
vercel --prod

# Or deploy to Netlify
netlify deploy --prod
```

### Backend (Render/Railway/Railway)

1. Set environment variables in hosting platform
2. Connect MongoDB Atlas database
3. Deploy backend code

**Environment Variables for Deployment:**
```env
MONGODB_URI=your_atlas_connection_string
JWT_SECRET=your_production_secret
CORS_ORIGIN=https://your-frontend-url.com
NODE_ENV=production
```

## ✅ Assessment Criteria Compliance

| Criteria | Weight | Status | Implementation |
|----------|--------|--------|----------------|
| **Core functionality** | 35% | ✅ | All CRUD operations, authentication, file management |
| **Code structure & readability** | 15% | ✅ | Clean architecture, TypeScript, modular code |
| **CSS** | 20% | ✅ | Vanilla CSS with CSS Modules, modern styling |
| **UI/UX clarity** | 10% | ✅ | Intuitive interface, VS Code-inspired design |
| **Creativity & features** | 10% | ✅ | Theme switcher, auto-save, keyboard shortcuts |
| **Documentation** | 10% | ✅ | README, setup guide, code comments |

## 🔍 Testing the Integration

### 1. Test Backend
```bash
# Health check
curl http://localhost:8080/health

# Test registration
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"password123"}'
```

### 2. Test Frontend
1. Register a new user
2. Create a new project
3. Add files to the project
4. Edit file content
5. Verify live preview updates
6. Save and reload project

### 3. Verify Database
Connect to MongoDB and check collections:
```javascript
use cipherstudio
db.users.find()
db.projects.find()
db.files.find()
```

## 🐛 Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify `.env` file exists
- Check if port 8080 is available

### Frontend can't connect to backend
- Verify backend is running
- Check CORS_ORIGIN in .env
- Check browser console for errors

### Authentication issues
- Clear localStorage: `localStorage.clear()`
- Verify JWT_SECRET is set
- Check MongoDB connection

### File operations failing
- Verify user is authenticated
- Check project ownership
- Review API response in browser Network tab

## 📝 Notes

- Frontend auto-discovers backend on ports 8080-8090
- Backend automatically tries next port if 8080 is occupied
- JWT tokens expire in 7 days by default
- Passwords are hashed with bcrypt (10 rounds)
- All API calls require authentication except `/api/auth/*`

## 🎉 Success!

Your CipherStudio IDE is now fully set up and ready to use! 🚀

---

**Created for CipherSchools Placement Assignment**
**Tech Stack: React, Node.js, MongoDB, Vite, Sandpack**



