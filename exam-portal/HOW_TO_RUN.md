# 🚀 How to Run the Exam Portal - Step by Step

## Prerequisites Checklist

Before starting, make sure you have:

- [ ] **Node.js** installed (v14 or higher)
- [ ] **MongoDB** installed and running
- [ ] **Code Editor** (VS Code recommended)
- [ ] **Terminal/Command Prompt** access

---

## Step 1: Check Prerequisites

### Check Node.js Installation
```bash
node --version
# Should show: v14.x.x or higher

npm --version
# Should show: 6.x.x or higher
```

**If not installed:**
- Download from: https://nodejs.org/
- Install and restart your computer

### Check MongoDB Installation
```bash
mongod --version
# Should show MongoDB version
```

**If not installed:**
- **Windows**: Download from https://www.mongodb.com/try/download/community
- **Mac**: `brew install mongodb-community`
- **Linux**: Follow MongoDB installation guide

**Alternative**: Use MongoDB Atlas (cloud) - no installation needed!

---

## Step 2: Install Dependencies

### Open Terminal/Command Prompt

**Windows:**
- Press `Win + R`
- Type `cmd` and press Enter
- Or use PowerShell

**Mac/Linux:**
- Open Terminal app

### Navigate to Backend Folder
```bash
cd "C:\Users\ROHIT THAKKAR\Desktop\IDT-1\exam-portal\backend"
```

**Or if you're already in IDT-1 folder:**
```bash
cd exam-portal/backend
```

### Install Node Packages
```bash
npm install
```

**What this does:**
- Downloads all required packages (express, mongoose, etc.)
- Creates `node_modules` folder
- Takes 1-2 minutes

**Expected output:**
```
added 150 packages in 30s
```

---

## Step 3: Setup MongoDB

### Option A: Local MongoDB (Recommended for Learning)

#### Start MongoDB Service

**Windows:**
```bash
# MongoDB usually runs as a service automatically
# Check if running:
net start MongoDB

# If not installed as service, start manually:
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath "C:\data\db"
```

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

#### Create Database Directory (if needed)
```bash
# Windows
mkdir C:\data\db

# Mac/Linux
mkdir -p /data/db
```

### Option B: MongoDB Atlas (Cloud - No Installation)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a free cluster
4. Get connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
5. Use this in Step 4

---

## Step 4: Create Environment File

### Create `.env` File

**Location:** `exam-portal/backend/.env`

**Windows (Command Prompt):**
```bash
cd "C:\Users\ROHIT THAKKAR\Desktop\IDT-1\exam-portal\backend"
type nul > .env
notepad .env
```

**Mac/Linux:**
```bash
cd exam-portal/backend
touch .env
nano .env
```

**Or create manually:**
1. Open `backend` folder in File Explorer
2. Create new file named `.env` (with the dot!)
3. Open with Notepad/Text Editor

### Add This Content to `.env`:

**For Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/exam-portal
JWT_SECRET=my-super-secret-jwt-key-2024-change-this
PORT=5000
```

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/exam-portal
JWT_SECRET=my-super-secret-jwt-key-2024-change-this
PORT=5000
```

**Important:**
- Replace `username` and `password` with your Atlas credentials
- Replace `cluster.mongodb.net` with your cluster URL
- Change `JWT_SECRET` to any random string (keep it secret!)

---

## Step 5: Start the Backend Server

### Navigate to Backend Folder
```bash
cd "C:\Users\ROHIT THAKKAR\Desktop\IDT-1\exam-portal\backend"
```

### Start Server
```bash
npm start
```

**Expected Output:**
```
========================================
🚀 Exam Portal Backend Server Started!
========================================
📍 Server running on: http://localhost:5000
✅ MongoDB Connected: localhost:27017
✅ Using MONGODB storage
========================================
```

**If you see errors:**

**Error: "MongoDB connection error"**
- Make sure MongoDB is running
- Check MONGODB_URI in .env file
- Try: `mongod` in separate terminal

**Error: "Cannot find module"**
- Run: `npm install` again
- Make sure you're in `backend` folder

**Error: "Port 5000 already in use"**
- Change PORT in .env to 5001
- Or close the program using port 5000

### Keep This Terminal Open!
The server must keep running. Don't close this terminal.

---

## Step 6: Open Frontend

### Option A: Using Live Server (VS Code)

1. Install "Live Server" extension in VS Code
2. Right-click on `exam-portal/frontend/index.html`
3. Select "Open with Live Server"
4. Browser opens automatically

### Option B: Using Python (Simple Server)

**Python 3:**
```bash
cd "C:\Users\ROHIT THAKKAR\Desktop\IDT-1\exam-portal\frontend"
python -m http.server 3000
```

**Python 2:**
```bash
cd "C:\Users\ROHIT THAKKAR\Desktop\IDT-1\exam-portal\frontend"
python -m SimpleHTTPServer 3000
```

Then open browser: `http://localhost:3000`

### Option C: Direct File Open (Limited)

1. Open `exam-portal/frontend/index.html` in browser
2. **Note**: Some features may not work (CORS issues)

---

## Step 7: Test the Application

### 1. Open Browser
Go to: `http://localhost:3000` (or whatever port you used)

### 2. Register a New User
- Click "Register"
- Fill in the form:
  - Name: Your Name
  - Email: test@example.com
  - Password: password123
  - Role: Student or Faculty
  - Department: Computer Science
  - Semester: 1
- Click "Register"

**Expected:**
- You should be logged in
- Dashboard appears
- No errors in browser console (F12)

### 3. Test Features
- [ ] View Dashboard
- [ ] Browse Materials
- [ ] Upload Material (if Faculty)
- [ ] Search Materials
- [ ] Use Chatbot

---

## 🐛 Troubleshooting

### Problem: "Cannot connect to server"

**Check:**
1. Is backend server running? (Check terminal)
2. Is it on port 5000? (Check .env file)
3. Open: http://localhost:5000 in browser
   - Should see: `{"message":"🚀 Exam Portal Backend is Running!"}`

**Fix:**
- Restart backend server
- Check for errors in terminal

---

### Problem: "MongoDB connection error"

**Check:**
1. Is MongoDB running?
   ```bash
   # Windows
   net start MongoDB
   
   # Mac
   brew services list
   ```

2. Is MONGODB_URI correct in .env?
   - Local: `mongodb://localhost:27017/exam-portal`
   - Atlas: Check connection string

**Fix:**
- Start MongoDB service
- Check .env file spelling
- Try connecting with MongoDB Compass

---

### Problem: "CORS error" in browser

**Check:**
- Backend server is running
- Frontend is accessing correct URL
- Check browser console (F12) for exact error

**Fix:**
- Make sure backend is on port 5000
- Update API_URL in `frontend/script.js` if needed

---

### Problem: "Module not found"

**Fix:**
```bash
cd backend
npm install
```

---

### Problem: "Port already in use"

**Fix:**
1. Change PORT in `.env` file to 5001
2. Update API_URL in `frontend/script.js` to `http://localhost:5001/api`
3. Restart server

---

## 📋 Quick Start Checklist

Use this checklist every time you start the project:

- [ ] MongoDB is running
- [ ] `.env` file exists in `backend` folder
- [ ] Dependencies installed (`npm install`)
- [ ] Backend server started (`npm start`)
- [ ] Frontend opened in browser
- [ ] Can see login/register page
- [ ] Can register new user
- [ ] Can login successfully

---

## 🎯 Development Workflow

### Daily Startup:
```bash
# 1. Start MongoDB (if local)
# Windows: Usually auto-starts
# Mac: brew services start mongodb-community

# 2. Start Backend
cd backend
npm start

# 3. Open Frontend
# Use Live Server or Python server
```

### Making Changes:
1. Edit code
2. Save file
3. **Backend**: Restart server (Ctrl+C, then `npm start`)
4. **Frontend**: Refresh browser (F5)

### For Auto-Restart (Development):
```bash
# Install nodemon (if not already)
npm install -g nodemon

# Use dev script
npm run dev
# Now server auto-restarts on file changes!
```

---

## 🚀 Production Deployment

### For Production:
1. Set `NODE_ENV=production` in .env
2. Use strong JWT_SECRET
3. Use MongoDB Atlas (cloud)
4. Deploy backend to Heroku/AWS
5. Deploy frontend to Vercel/Netlify

---

## 📞 Still Having Issues?

### Check Logs:
- **Backend**: Look at terminal where server is running
- **Frontend**: Open browser console (F12)
- **MongoDB**: Check MongoDB logs

### Common Mistakes:
1. ❌ Forgot to start MongoDB
2. ❌ Wrong MONGODB_URI in .env
3. ❌ Backend server not running
4. ❌ Wrong port numbers
5. ❌ Typo in .env file

### Get Help:
1. Read error message carefully
2. Check this guide again
3. Google the error message
4. Check MongoDB/Node.js documentation

---

## ✅ Success Indicators

You know it's working when:

✅ Backend terminal shows: "MongoDB Connected"  
✅ Backend terminal shows: "Server running on: http://localhost:5000"  
✅ Browser shows login/register page  
✅ Can register new user  
✅ Can login  
✅ Dashboard loads  
✅ No errors in browser console (F12)  

---

## 🎉 You're All Set!

Once everything is running:
1. Explore the application
2. Try all features
3. Read the code
4. Make modifications
5. Learn and grow!

**Happy Coding!** 🚀
