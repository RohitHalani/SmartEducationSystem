# MongoDB Setup Instructions

## Quick Start

1. **Install MongoDB** (if not already installed):
   - Windows: Download from https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

2. **Install Node Dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Create `.env` file** in the `backend` directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/exam-portal
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   ```

4. **Start MongoDB** (if using local MongoDB):
   - Windows: MongoDB should start automatically as a service
   - Or run: `mongod` in a separate terminal

5. **Start the Server**:
   ```bash
   cd backend/uploads
   node server.js
   ```

## For MongoDB Atlas (Cloud)

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get your connection string
4. Update `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/exam-portal
   ```

## What Changed?

✅ **Backend**:
- Migrated from file-based storage (database.json) to MongoDB
- All filtering, sorting, and data processing now happens on the backend
- New `/api/dashboard` endpoint returns pre-processed data
- Better performance and scalability

✅ **Frontend**:
- Reduced from ~789 lines to ~600 lines
- Removed client-side filtering and processing
- Simply displays data returned from backend
- Cleaner, more maintainable code

## Testing

1. Start the backend server
2. Open the frontend in a browser
3. Register a new user or login
4. The app should work exactly as before, but now using MongoDB!
