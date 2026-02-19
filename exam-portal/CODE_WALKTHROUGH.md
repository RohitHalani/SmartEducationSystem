# 🔍 Code Walkthrough - Line by Line Understanding

## 🎯 How to Use This Guide
1. Open the file mentioned
2. Read the explanation
3. Try to modify the code yourself
4. Test your changes

---

## 📁 File 1: `backend/config/database.js`

### What This File Does
Connects your application to MongoDB database.

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // This line connects to MongoDB
        const conn = await mongoose.connect(
            process.env.MONGODB_URI || 'mongodb://localhost:27017/exam-portal',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }
        );
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1); // Stops the server if connection fails
    }
};

module.exports = connectDB;
```

**Key Learning Points:**
- `async/await`: Waits for database connection before continuing
- `process.env.MONGODB_URI`: Gets connection string from .env file
- `||`: If .env doesn't have MONGODB_URI, use default local connection
- `module.exports`: Makes this function available to other files

---

## 📁 File 2: `backend/models/User.js`

### What This File Does
Defines what a User looks like in the database.

```javascript
const mongoose = require('mongoose');

// Define the structure (schema) of a User
const userSchema = new mongoose.Schema({
    name: {
        type: String,        // Must be text
        required: true,      // Cannot be empty
        trim: true          // Removes extra spaces
    },
    email: {
        type: String,
        required: true,
        unique: true,        // No two users can have same email
        lowercase: true,    // Converts to lowercase
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['student', 'faculty']  // Only these two values allowed
    },
    department: {
        type: String,
        default: 'Computer Science'  // If not provided, use this
    },
    semester: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true  // Automatically adds createdAt and updatedAt
});

// Remove password when converting to JSON (for security)
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;  // Don't send password to frontend!
    return user;
};

// Create and export the User model
module.exports = mongoose.model('User', userSchema);
```

**Key Learning Points:**
- `Schema`: Blueprint for documents in MongoDB
- `required: true`: Field must exist (validation)
- `unique: true`: Database enforces uniqueness
- `timestamps: true`: Auto-adds createdAt/updatedAt
- `methods.toJSON`: Customizes what gets sent to frontend

---

## 📁 File 3: `backend/uploads/server.js` - Part 1: Setup

### Lines 1-18: Imports and Setup

```javascript
require('dotenv').config();  // Load .env file
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');

// Import our custom files
const connectDB = require('../../config/database');
const User = require('../../models/User');
const Material = require('../../models/Material');
const Chat = require('../../models/Chat');

// Connect to database
connectDB();

const app = express();
```

**What's happening:**
- Loading all necessary libraries
- Importing our custom models and config
- Creating Express app instance

### Lines 20-27: Middleware

```javascript
// Middleware - runs on every request
app.use(cors({
    origin: '*',           // Allow requests from any origin
    credentials: true       // Allow cookies/credentials
}));
app.use(express.json());    // Parse JSON request bodies
app.use('/uploads', express.static('uploads'));  // Serve uploaded files
```

**Middleware Explained:**
- `app.use()`: Runs on every request
- `cors()`: Allows frontend (different port) to make requests
- `express.json()`: Converts JSON strings to JavaScript objects
- `express.static()`: Makes files in 'uploads' folder accessible via URL

---

## 📁 File 3: `backend/uploads/server.js` - Part 2: Authentication

### Lines 70-85: Authentication Middleware

```javascript
const authMiddleware = async (req, res, next) => {
    // Extract token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    try {
        // Verify token and decode user info
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-2024');
        req.user = decoded;  // Add user info to request object
        next();  // Continue to next middleware/route
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};
```

**How It Works:**
1. Frontend sends: `Authorization: Bearer <token>`
2. Backend extracts token
3. Verifies token is valid (not expired, correct secret)
4. Decodes user info (userId, role, email)
5. Adds to `req.user` so routes can use it
6. Calls `next()` to continue

**Example Flow:**
```
Request → authMiddleware → (if valid) → Route Handler
Request → authMiddleware → (if invalid) → Error Response
```

---

## 📁 File 3: `backend/uploads/server.js` - Part 3: Registration Route

### Lines 107-176: User Registration

```javascript
app.post('/api/auth/register', async (req, res) => {
    try {
        console.log('📝 Registration attempt:', req.body);
        
        // Step 1: Extract data from request body
        const { name, email, password, role, department, semester } = req.body;
        
        // Step 2: Validate required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Step 3: Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Step 4: Hash password (NEVER store plain passwords!)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Step 5: Create user in database
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: role,
            department: department || 'Computer Science',
            semester: semester ? parseInt(semester) : 1
        });
        
        console.log('✅ User registered:', user.email);

        // Step 6: Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id.toString(), 
                role: user.role, 
                email: user.email 
            },
            process.env.JWT_SECRET || 'fallback-secret-key-2024',
            { expiresIn: '7d' }  // Token valid for 7 days
        );

        // Step 7: Send response
        res.status(201).json({
            message: 'User registered successfully!',
            token,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                semester: user.semester
            }
        });

    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ 
            error: 'Registration failed. Please try again.'
        });
    }
});
```

**Step-by-Step Breakdown:**

1. **Extract Data**: `req.body` contains form data from frontend
2. **Validate**: Check if required fields exist
3. **Check Duplicate**: Query database to see if email exists
4. **Hash Password**: Convert "password123" → "$2a$10$hashedstring..."
5. **Create User**: Save to MongoDB
6. **Generate Token**: Create JWT with user info
7. **Send Response**: Return token and user data (without password!)

**Why Hash Passwords?**
```
Plain: "password123"
Hashed: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
```
Even if database is hacked, attackers can't see actual passwords!

---

## 📁 File 3: `backend/uploads/server.js` - Part 4: Get Materials with Filtering

### Lines 291-331: Get All Materials

```javascript
app.get('/api/materials', authMiddleware, async (req, res) => {
    try {
        // Step 1: Extract query parameters from URL
        // Example: /api/materials?department=CS&semester=3&search=python
        const { department, semester, subject, type, search } = req.query;
        
        // Step 2: Build query object dynamically
        const query = {};
        
        if (department) {
            query.department = department;  // { department: 'CS' }
        }
        if (semester) {
            query.semester = parseInt(semester);  // { semester: 3 }
        }
        if (type) {
            query.type = type;  // { type: 'pyq' }
        }
        if (subject) {
            query.subject = { $regex: subject, $options: 'i' };  // Case-insensitive search
        }
        if (search) {
            // Search in multiple fields
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } }
            ];
        }

        // Step 3: Execute MongoDB query
        const materials = await Material.find(query)
            .sort({ createdAt: -1 })  // Newest first
            .lean();  // Returns plain JavaScript objects (faster)

        // Step 4: Format response (add id field for frontend compatibility)
        const formattedMaterials = materials.map(material => ({
            id: material._id.toString(),
            _id: material._id.toString(),
            ...material  // Spread operator: copies all other properties
        }));
        
        res.json(formattedMaterials);
    } catch (error) {
        console.error('❌ Get materials error:', error);
        res.status(500).json({ error: error.message });
    }
});
```

**MongoDB Query Examples:**

```javascript
// Simple query
Material.find({ department: 'CS' })

// Multiple conditions (AND)
Material.find({ 
    department: 'CS', 
    semester: 3 
})

// OR condition
Material.find({
    $or: [
        { department: 'CS' },
        { department: 'IT' }
    ]
})

// Search (case-insensitive)
Material.find({
    title: { $regex: 'python', $options: 'i' }
})

// Combined
Material.find({
    department: 'CS',
    $or: [
        { title: { $regex: 'python', $options: 'i' } },
        { description: { $regex: 'python', $options: 'i' } }
    ]
}).sort({ createdAt: -1 })
```

---

## 📁 File 4: `frontend/script.js` - Part 1: API Communication

### Lines 1-4: Configuration

```javascript
const API_URL = 'http://localhost:5000/api';
let currentUser = null;
let authToken = localStorage.getItem('token');
```

**What's happening:**
- `API_URL`: Base URL for all API calls
- `currentUser`: Stores logged-in user info
- `localStorage.getItem('token')`: Gets saved token from browser storage

### Lines 307-339: Load Materials Function

```javascript
async function loadMaterials() {
    try {
        // Step 1: Build URL with query parameters
        let url = `${API_URL}/materials?`;
        const dept = document.getElementById('filterDepartment')?.value;
        const sem = document.getElementById('filterSemester')?.value;
        const type = document.getElementById('filterType')?.value;
        const search = document.getElementById('searchInput')?.value;

        // Add parameters to URL if they exist
        if (dept) url += `department=${encodeURIComponent(dept)}&`;
        if (sem) url += `semester=${encodeURIComponent(sem)}&`;
        if (type) url += `type=${encodeURIComponent(type)}&`;
        if (search) url += `search=${encodeURIComponent(search)}&`;

        // Step 2: Make API request
        const response = await fetch(url, {
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        // Step 3: Check if request was successful
        if (!response.ok) throw new Error('Failed to fetch materials');
        
        // Step 4: Convert response to JavaScript object
        const materials = await response.json();
        
        // Step 5: Display materials in UI
        displayMaterials(materials);
    } catch (error) {
        console.error('Error loading materials:', error);
        // Show error message to user
        document.getElementById('materialsList').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i> Error loading materials: ${error.message}
            </div>
        `;
    }
}
```

**URL Building Example:**
```javascript
// If user selects:
// Department: "CS"
// Semester: "3"
// Search: "python"

// URL becomes:
"http://localhost:5000/api/materials?department=CS&semester=3&search=python&"
```

**Fetch API Breakdown:**
```javascript
fetch(url, {
    method: 'GET',  // Default, can omit
    headers: {
        'Authorization': `Bearer ${token}`,  // For authentication
        'Content-Type': 'application/json'     // Tell server we're sending JSON
    }
})
.then(response => response.json())  // Convert to object
.then(data => console.log(data));   // Use the data
```

---

## 📁 File 4: `frontend/script.js` - Part 2: Form Handling

### Lines 94-126: Login Function

```javascript
async function handleLogin(e) {
    e.preventDefault();  // Prevent page reload
    
    // Step 1: Get form values
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorElement = document.getElementById('loginError');

    try {
        // Step 2: Send login request
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })  // Convert to JSON string
        });

        // Step 3: Get response data
        const data = await response.json();
        
        // Step 4: Handle success or error
        if (response.ok) {
            // Success: Save token and user info
            authToken = data.token;
            localStorage.setItem('token', authToken);  // Save to browser
            currentUser = data.user;
            console.log('✅ Login successful');
            showDashboard();  // Navigate to dashboard
            hideError(errorElement);
        } else {
            // Error: Show error message
            showError(errorElement, data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(errorElement, 'Network error. Please try again.');
    }
}
```

**Key Concepts:**
- `e.preventDefault()`: Stops form's default submit (which reloads page)
- `JSON.stringify()`: Converts `{ email, password }` to `'{"email":"...","password":"..."}'`
- `localStorage.setItem()`: Saves data in browser (persists after closing)
- `response.ok`: True if status code is 200-299

---

## 🔄 Complete Request Flow Example

### User Clicks "Login" Button

```
1. Frontend (script.js)
   ↓
   User enters email/password
   ↓
   handleLogin() called
   ↓
   fetch('/api/auth/login', { email, password })
   
2. Backend (server.js)
   ↓
   Request arrives at POST /api/auth/login
   ↓
   Extract email/password from req.body
   ↓
   Find user in MongoDB: User.findOne({ email })
   ↓
   Compare password: bcrypt.compare(password, user.password)
   ↓
   Generate token: jwt.sign({ userId, role })
   ↓
   Send response: { token, user }
   
3. Frontend (script.js)
   ↓
   Receive response
   ↓
   Save token: localStorage.setItem('token', token)
   ↓
   Save user: currentUser = user
   ↓
   Navigate: showDashboard()
```

---

## 🎯 Practice: Add a New Feature

### Task: Add "Favorites" Feature

**Step 1: Update Material Model**
```javascript
// In backend/models/Material.js
favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
}]
```

**Step 2: Create Backend Route**
```javascript
// In backend/uploads/server.js
app.post('/api/materials/:id/favorite', authMiddleware, async (req, res) => {
    const material = await Material.findById(req.params.id);
    const userId = req.user.userId;
    
    const index = material.favorites.indexOf(userId);
    if (index > -1) {
        material.favorites.splice(index, 1);
    } else {
        material.favorites.push(userId);
    }
    
    await material.save();
    res.json({ favorites: material.favorites.length });
});
```

**Step 3: Add Frontend Function**
```javascript
// In frontend/script.js
async function favoriteMaterial(id) {
    const response = await fetch(`${API_URL}/materials/${id}/favorite`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (response.ok) {
        loadMaterials();  // Refresh list
    }
}
```

**Step 4: Add Button in HTML**
```html
<button onclick="favoriteMaterial('${material.id}')">
    <i class="fas fa-star"></i> Favorite
</button>
```

---

## 📝 Key Takeaways

1. **Backend handles logic**: All processing happens on server
2. **Frontend displays data**: Just shows what backend sends
3. **MongoDB stores data**: No files, everything in database
4. **JWT for auth**: Tokens prove user is logged in
5. **Async/await**: Modern way to handle API calls
6. **Middleware**: Runs before routes (auth, validation, etc.)

---

## 🚀 Next Steps

1. Read each file line by line
2. Add console.log() to see what's happening
3. Modify code and see what breaks
4. Add a new feature yourself
5. Read error messages carefully
6. Use browser DevTools to debug
7. Use Postman to test API endpoints

Remember: **The best way to learn is by doing!** 🎉
