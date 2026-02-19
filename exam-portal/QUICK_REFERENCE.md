# ⚡ Quick Reference Guide

## 🚀 Getting Started

```bash
# Install dependencies
cd backend
npm install

# Create .env file
MONGODB_URI=mongodb://localhost:27017/exam-portal
JWT_SECRET=your-secret-key
PORT=5000

# Start server
npm start
```

---

## 📝 Common Code Patterns

### Backend: Create Route
```javascript
app.post('/api/endpoint', authMiddleware, async (req, res) => {
    try {
        const data = await Model.create(req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

### Backend: Get All with Filter
```javascript
app.get('/api/items', async (req, res) => {
    const query = {};
    if (req.query.filter) query.field = req.query.filter;
    
    const items = await Model.find(query);
    res.json(items);
});
```

### Backend: Get One by ID
```javascript
app.get('/api/items/:id', async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
});
```

### Backend: Update
```javascript
app.put('/api/items/:id', async (req, res) => {
    const item = await Model.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
    res.json(item);
});
```

### Backend: Delete
```javascript
app.delete('/api/items/:id', async (req, res) => {
    await Model.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});
```

---

### Frontend: API Call (GET)
```javascript
async function loadData() {
    const response = await fetch(`${API_URL}/items`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await response.json();
    return data;
}
```

### Frontend: API Call (POST)
```javascript
async function createItem(itemData) {
    const response = await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(itemData)
    });
    return await response.json();
}
```

### Frontend: Form Submit
```javascript
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value
    };
    await createItem(data);
});
```

---

## 🗄️ MongoDB Queries

### Find All
```javascript
await Model.find()
```

### Find with Condition
```javascript
await Model.find({ status: 'active' })
```

### Find One
```javascript
await Model.findOne({ email: 'user@example.com' })
```

### Find by ID
```javascript
await Model.findById(id)
```

### Search (Case-insensitive)
```javascript
await Model.find({ 
    name: { $regex: 'search', $options: 'i' } 
})
```

### Multiple Conditions (AND)
```javascript
await Model.find({ 
    status: 'active',
    age: { $gte: 18 }
})
```

### Multiple Conditions (OR)
```javascript
await Model.find({
    $or: [
        { status: 'active' },
        { status: 'pending' }
    ]
})
```

### Sort
```javascript
await Model.find().sort({ createdAt: -1 })  // Newest first
```

### Limit & Skip (Pagination)
```javascript
await Model.find()
    .skip((page - 1) * limit)
    .limit(limit)
```

### Count
```javascript
await Model.countDocuments({ status: 'active' })
```

---

## 🔐 Authentication

### Create Token
```javascript
const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
);
```

### Verify Token (Middleware)
```javascript
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
};
```

### Hash Password
```javascript
const hashed = await bcrypt.hash(password, 10);
const isMatch = await bcrypt.compare(password, hashed);
```

---

## 📁 File Upload

### Setup Multer
```javascript
const multer = require('multer');
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });
```

### Upload Route
```javascript
app.post('/api/upload', upload.single('file'), (req, res) => {
    res.json({ fileUrl: `/uploads/${req.file.filename}` });
});
```

---

## 🎨 Frontend Patterns

### Show/Hide Elements
```javascript
element.classList.add('hidden');
element.classList.remove('hidden');
element.classList.toggle('hidden');
```

### Update Text
```javascript
element.textContent = 'New text';
element.innerHTML = '<strong>HTML</strong>';
```

### Get Form Values
```javascript
const value = document.getElementById('inputId').value;
```

### Set Form Values
```javascript
document.getElementById('inputId').value = 'New value';
```

### Create Element
```javascript
const div = document.createElement('div');
div.className = 'my-class';
div.textContent = 'Content';
parentElement.appendChild(div);
```

### Error Handling
```javascript
try {
    const data = await fetchData();
} catch (error) {
    console.error('Error:', error);
    showError('Something went wrong');
}
```

---

## 🐛 Common Errors & Fixes

### "Cannot read property of undefined"
**Fix**: Add null check
```javascript
if (user) {
    console.log(user.name);
}
```

### "MongoError: E11000 duplicate key"
**Fix**: Email already exists, check before creating

### "JWT malformed"
**Fix**: Token missing or invalid, check Authorization header

### "Cast to ObjectId failed"
**Fix**: Invalid ID format, validate before querying

### CORS Error
**Fix**: Add CORS middleware
```javascript
app.use(cors());
```

---

## 📊 Data Flow Diagram

```
User Action
    ↓
Frontend (script.js)
    ↓
Fetch API Call
    ↓
Backend Route (server.js)
    ↓
Middleware (auth, validation)
    ↓
Mongoose Model
    ↓
MongoDB Database
    ↓
Response
    ↓
Frontend Display
```

---

## 🔑 Key Concepts

### Async/Await
```javascript
// Instead of:
fetch(url).then(response => response.json()).then(data => ...)

// Use:
const response = await fetch(url);
const data = await response.json();
```

### Spread Operator
```javascript
const newObj = { ...oldObj, newField: 'value' };
```

### Optional Chaining
```javascript
const name = user?.profile?.name;  // Won't error if null
```

### Template Literals
```javascript
const message = `Hello ${name}, you have ${count} items`;
```

---

## 📚 File Structure

```
backend/
├── config/
│   └── database.js      # MongoDB connection
├── models/
│   ├── User.js          # User schema
│   ├── Material.js      # Material schema
│   └── Chat.js          # Chat schema
└── uploads/
    └── server.js        # Main server file

frontend/
├── index.html           # HTML structure
├── script.js            # JavaScript logic
└── style.css            # Styling
```

---

## 🎯 Common Tasks

### Add New Field to Model
1. Update schema in `models/Model.js`
2. Update routes that use it
3. Test with Postman

### Add New Route
1. Add route in `server.js`
2. Add authentication if needed
3. Test endpoint
4. Call from frontend

### Add New Frontend Feature
1. Add HTML elements
2. Add JavaScript function
3. Call API endpoint
4. Update UI with response

---

## 💡 Pro Tips

1. **Always validate input** on backend
2. **Never trust frontend** - validate on server
3. **Hash passwords** - never store plain text
4. **Use try/catch** for error handling
5. **Add logging** to debug issues
6. **Test with Postman** before frontend
7. **Read error messages** carefully
8. **Use async/await** for cleaner code
9. **Check null/undefined** before using
10. **Use meaningful variable names**

---

## 🚨 Security Checklist

- [ ] Passwords are hashed
- [ ] JWT tokens are verified
- [ ] File uploads are validated
- [ ] User input is sanitized
- [ ] Authentication required for protected routes
- [ ] Role-based access control implemented
- [ ] CORS configured properly
- [ ] Environment variables for secrets
- [ ] Error messages don't leak sensitive info

---

**Keep this guide handy while coding!** 📌
