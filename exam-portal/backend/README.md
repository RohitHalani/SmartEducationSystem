# Exam Portal Backend - MongoDB Setup

## Prerequisites
- Node.js installed
- MongoDB installed and running (or MongoDB Atlas account)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the `backend` directory with the following:
```
MONGODB_URI=mongodb://localhost:27017/exam-portal
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
```

For MongoDB Atlas (cloud), use:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/exam-portal
```

3. Make sure MongoDB is running:
   - Local: Start MongoDB service
   - Atlas: Use the connection string from your cluster

4. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

## Changes from File-based Storage

- ✅ Migrated from file-based storage (database.json) to MongoDB
- ✅ All filtering and data processing moved to backend
- ✅ Frontend simplified - only handles display and API calls
- ✅ New `/api/dashboard` endpoint returns pre-processed stats
- ✅ Better performance with database queries instead of file I/O

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/dashboard` - Get dashboard data (stats + recent materials)
- `GET /api/materials` - Get materials (with backend filtering)
- `POST /api/materials` - Upload material (faculty only)
- `GET /api/materials/:id` - Get single material
- `POST /api/materials/:id/like` - Like/unlike material
- `POST /api/materials/:id/download` - Download material
- `DELETE /api/materials/:id` - Delete material (faculty only)
- `POST /api/chat` - Send chat message
- `GET /api/chat/history` - Get chat history
- `GET /api/stats` - Get statistics
