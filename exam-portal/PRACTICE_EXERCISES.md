# 🏋️ Practice Exercises - Master the Stack

## How to Use This Guide
1. Complete exercises in order
2. Don't copy-paste - type everything yourself
3. When stuck, read the error message carefully
4. Use console.log() to debug
5. Test each feature before moving to next

---

## 🎯 Level 1: Beginner Exercises

### Exercise 1.1: Add Console Logging
**Goal**: Understand request flow

**Task**: Add console.log() statements to see what's happening

**In `server.js`, add logging:**
```javascript
app.post('/api/auth/login', async (req, res) => {
    console.log('📥 Login request received');
    console.log('Email:', req.body.email);
    
    const user = await User.findOne({ email: req.body.email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    // ... rest of code
    
    console.log('📤 Sending response');
    res.json({ token, user });
});
```

**Test**: Try logging in and watch the terminal output

---

### Exercise 1.2: Add a Simple Endpoint
**Goal**: Create your first API endpoint

**Task**: Create `/api/test` endpoint that returns current time

**Steps:**
1. Open `backend/uploads/server.js`
2. Add this route:
```javascript
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Test endpoint works!',
        currentTime: new Date().toISOString()
    });
});
```
3. Start server: `npm start`
4. Visit: `http://localhost:5000/api/test`
5. You should see JSON response!

**Challenge**: Add your name to the response

---

### Exercise 1.3: Modify User Model
**Goal**: Understand MongoDB schemas

**Task**: Add a "phone" field to User model

**Steps:**
1. Open `backend/models/User.js`
2. Add to schema:
```javascript
phone: {
    type: String,
    trim: true
}
```
3. Update registration route to accept phone
4. Test registration with phone number

**Challenge**: Make phone optional but validate format if provided

---

## 🎯 Level 2: Intermediate Exercises

### Exercise 2.1: Add Material Rating
**Goal**: Add new feature end-to-end

**Task**: Allow users to rate materials (1-5 stars)

**Backend Steps:**
1. Update Material model:
```javascript
ratings: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 }
}]
```

2. Create route:
```javascript
app.post('/api/materials/:id/rate', authMiddleware, async (req, res) => {
    const { rating } = req.body;
    const material = await Material.findById(req.params.id);
    
    // Remove existing rating from this user
    material.ratings = material.ratings.filter(
        r => r.userId.toString() !== req.user.userId
    );
    
    // Add new rating
    material.ratings.push({
        userId: req.user.userId,
        rating: parseInt(rating)
    });
    
    await material.save();
    
    // Calculate average
    const avgRating = material.ratings.reduce((sum, r) => sum + r.rating, 0) / material.ratings.length;
    
    res.json({ 
        averageRating: avgRating.toFixed(1),
        totalRatings: material.ratings.length
    });
});
```

**Frontend Steps:**
1. Add rating display in `displayMaterials()`
2. Add rating buttons
3. Create `rateMaterial()` function

**Test**: Rate a material and see average rating update

---

### Exercise 2.2: Add Search Suggestions
**Goal**: Implement autocomplete

**Task**: Show search suggestions as user types

**Backend:**
```javascript
app.get('/api/materials/suggestions', authMiddleware, async (req, res) => {
    const { q } = req.query;  // Query string
    
    if (!q || q.length < 2) {
        return res.json([]);
    }
    
    // Find materials matching search
    const materials = await Material.find({
        $or: [
            { title: { $regex: q, $options: 'i' } },
            { subject: { $regex: q, $options: 'i' } }
        ]
    })
    .select('title subject')  // Only return these fields
    .limit(5)
    .lean();
    
    // Extract unique suggestions
    const suggestions = [...new Set(
        materials.flatMap(m => [m.title, m.subject])
    )].slice(0, 5);
    
    res.json(suggestions);
});
```

**Frontend:**
```javascript
async function loadSuggestions(searchTerm) {
    if (searchTerm.length < 2) return;
    
    const response = await fetch(`${API_URL}/materials/suggestions?q=${searchTerm}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const suggestions = await response.json();
    displaySuggestions(suggestions);
}
```

---

### Exercise 2.3: Add Pagination
**Goal**: Handle large datasets efficiently

**Task**: Add pagination to materials list

**Backend:**
```javascript
app.get('/api/materials', authMiddleware, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await Material.countDocuments(query);
    
    // Get paginated results
    const materials = await Material.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    
    res.json({
        materials,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit
        }
    });
});
```

**Frontend:**
```javascript
let currentPage = 1;

async function loadMaterials(page = 1) {
    const response = await fetch(`${API_URL}/materials?page=${page}&limit=10`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const data = await response.json();
    displayMaterials(data.materials);
    displayPagination(data.pagination);
}

function displayPagination(pagination) {
    // Show page numbers, prev/next buttons
    // Update currentPage when clicked
}
```

---

## 🎯 Level 3: Advanced Exercises

### Exercise 3.1: Add File Validation
**Goal**: Secure file uploads

**Task**: Validate file type and size before upload

**Backend:**
```javascript
const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },  // 10MB max
    fileFilter: (req, file, cb) => {
        // Only allow PDF, DOC, DOCX
        const allowedTypes = ['application/pdf', 'application/msword', 
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and Word documents allowed.'));
        }
    }
});
```

**Test**: Try uploading different file types

---

### Exercise 3.2: Add Material Categories
**Goal**: Organize materials better

**Task**: Create category system

**Steps:**
1. Create Category model:
```javascript
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    color: String  // For UI display
});
```

2. Link materials to categories:
```javascript
// In Material model
category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
}
```

3. Create category management routes
4. Add category filter in frontend

---

### Exercise 3.3: Add Material Comments
**Goal**: Build nested data structures

**Task**: Allow users to comment on materials

**Backend:**
```javascript
// In Material model
comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    text: String,
    createdAt: { type: Date, default: Date.now },
    replies: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: String,
        text: String,
        createdAt: { type: Date, default: Date.now }
    }]
}]

// Route to add comment
app.post('/api/materials/:id/comments', authMiddleware, async (req, res) => {
    const { text } = req.body;
    const material = await Material.findById(req.params.id);
    const user = await User.findById(req.user.userId);
    
    material.comments.push({
        userId: user._id,
        userName: user.name,
        text: text
    });
    
    await material.save();
    res.json(material.comments);
});
```

---

## 🎯 Level 4: Mastery Exercises

### Exercise 4.1: Add Real-time Notifications
**Goal**: Learn WebSockets (Socket.io)

**Task**: Notify users when new materials are uploaded

**Steps:**
1. Install: `npm install socket.io`
2. Setup Socket.io in server
3. Emit event when material uploaded
4. Listen in frontend

---

### Exercise 4.2: Add Material Analytics
**Goal**: Track and display statistics

**Task**: Show material views, popular materials, etc.

**Backend:**
```javascript
// Add views tracking
app.get('/api/materials/:id', authMiddleware, async (req, res) => {
    const material = await Material.findByIdAndUpdate(
        req.params.id,
        { $inc: { views: 1 } },  // Increment views
        { new: true }
    );
    res.json(material);
});

// Popular materials endpoint
app.get('/api/materials/popular', authMiddleware, async (req, res) => {
    const materials = await Material.find()
        .sort({ views: -1, downloads: -1 })
        .limit(10)
        .lean();
    res.json(materials);
});
```

---

### Exercise 4.3: Add Material Versioning
**Goal**: Handle updates to materials

**Task**: Allow faculty to upload new versions

**Backend:**
```javascript
// In Material model
versions: [{
    version: Number,
    fileUrl: String,
    fileName: String,
    uploadedAt: Date,
    changes: String  // What changed in this version
}],
currentVersion: { type: Number, default: 1 }

// Route to add new version
app.post('/api/materials/:id/version', authMiddleware, facultyOnly, upload.single('file'), async (req, res) => {
    const material = await Material.findById(req.params.id);
    const newVersion = material.currentVersion + 1;
    
    material.versions.push({
        version: newVersion,
        fileUrl: `/uploads/${req.file.filename}`,
        fileName: req.file.originalname,
        uploadedAt: new Date(),
        changes: req.body.changes
    });
    
    material.currentVersion = newVersion;
    material.fileUrl = `/uploads/${req.file.filename}`;
    
    await material.save();
    res.json(material);
});
```

---

## 🐛 Debugging Exercises

### Exercise D.1: Find the Bug
**Code with bug:**
```javascript
app.get('/api/materials', async (req, res) => {
    const materials = await Material.find();
    res.json(materials);
});
```

**Problem**: Missing authentication! Anyone can access.

**Fix**: Add `authMiddleware`

---

### Exercise D.2: Fix the Error
**Error**: "Cannot read property 'name' of undefined"

**Code:**
```javascript
const user = await User.findById(req.user.userId);
res.json({ name: user.name });
```

**Problem**: User might not exist

**Fix**: Add null check
```javascript
const user = await User.findById(req.user.userId);
if (!user) {
    return res.status(404).json({ error: 'User not found' });
}
res.json({ name: user.name });
```

---

## ✅ Testing Checklist

After each exercise, test:

- [ ] Does it work with valid data?
- [ ] Does it handle invalid data?
- [ ] Does it handle missing data?
- [ ] Are errors caught and displayed?
- [ ] Is authentication required?
- [ ] Are permissions checked?
- [ ] Does it work in browser DevTools?
- [ ] Are console errors fixed?

---

## 🎓 Mastery Checklist

You've mastered the stack when you can:

- [ ] Create new MongoDB models without looking at examples
- [ ] Write complex MongoDB queries
- [ ] Add new API endpoints independently
- [ ] Debug errors by reading error messages
- [ ] Understand async/await and promises
- [ ] Implement authentication correctly
- [ ] Handle file uploads securely
- [ ] Optimize database queries
- [ ] Add features to frontend
- [ ] Connect frontend to backend APIs

---

## 💡 Tips for Success

1. **Read Error Messages**: They tell you exactly what's wrong
2. **Use Console.log()**: See what data you're working with
3. **Test Incrementally**: Don't write everything at once
4. **Read Documentation**: MDN, Mongoose docs, Express docs
5. **Ask Questions**: "Why does this work?" "What happens if...?"
6. **Break Things**: Intentionally break code to understand it
7. **Fix Things**: Learn by fixing your mistakes

---

## 🚀 Next Level

Once you complete these exercises:

1. **Deploy**: Put your app online (Heroku, Vercel, AWS)
2. **Add Tests**: Write unit tests (Jest)
3. **Add CI/CD**: Automate testing and deployment
4. **Optimize**: Add caching, database indexes
5. **Scale**: Handle more users, more data
6. **Learn More**: React, TypeScript, GraphQL, etc.

---

**Remember**: Every expert was once a beginner. Keep practicing! 💪
