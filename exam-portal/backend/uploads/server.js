require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');

// Import models and database config
const connectDB = require('../../config/database');
const User = require('../../models/User');
const Material = require('../../models/Material');
const Chat = require('../../models/Chat');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// File Upload Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path.join(__dirname, 'uploads');
        const fs = require('fs');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }
});

// Authentication Middleware
const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-2024');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

// Faculty Authorization Middleware
const facultyOnly = (req, res, next) => {
    if (req.user.role !== 'faculty') {
        return res.status(403).json({ error: 'Access denied. Faculty only.' });
    }
    next();
};

// Routes

// Test Route
app.get('/', (req, res) => {
    res.json({ 
        message: '🚀 Exam Portal Backend is Running! (MongoDB)',
        timestamp: new Date().toISOString(),
        status: 'active',
        database: 'MongoDB'
    });
});

// Register Route
app.post('/api/auth/register', async (req, res) => {
    try {
        console.log('📝 Registration attempt:', req.body);
        
        const { name, email, password, role, department, semester } = req.body;
        
        // Validation
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: role,
            department: department || 'Computer Science',
            semester: semester ? parseInt(semester) : 1
        });
        
        console.log('✅ User registered:', user.email);

        // Generate token
        const token = jwt.sign(
            { 
                userId: user._id.toString(), 
                role: user.role, 
                email: user.email 
            },
            process.env.JWT_SECRET || 'fallback-secret-key-2024',
            { expiresIn: '7d' }
        );

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

// Login Route
app.post('/api/auth/login', async (req, res) => {
    try {
        console.log('🔐 Login attempt for:', req.body.email);
        
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id.toString(), role: user.role, email: user.email },
            process.env.JWT_SECRET || 'fallback-secret-key-2024',
            { expiresIn: '7d' }
        );

        console.log('✅ Login successful:', user.email);

        res.json({
            message: 'Login successful!',
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
        console.error('❌ Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Get Current User
app.get('/api/auth/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            semester: user.semester
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload Material (Faculty only)
app.post('/api/materials', authMiddleware, facultyOnly, upload.single('file'), async (req, res) => {
    try {
        const { title, description, subject, department, semester, type, year } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const user = await User.findById(req.user.userId);

        const material = await Material.create({
            title,
            description: description || '',
            subject,
            department,
            semester: parseInt(semester),
            type,
            year: year ? parseInt(year) : null,
            fileUrl: `/uploads/${req.file.filename}`,
            fileName: req.file.originalname,
            uploadedBy: req.user.userId,
            uploadedByName: user?.name || 'Faculty',
            likes: [],
            downloads: 0
        });

        console.log('✅ Material uploaded:', material.title);

        res.status(201).json({ 
            message: 'Material uploaded successfully!', 
            material: {
                id: material._id.toString(),
                ...material.toJSON()
            }
        });
    } catch (error) {
        console.error('❌ Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get All Materials with Advanced Filtering (Backend Processing)
app.get('/api/materials', authMiddleware, async (req, res) => {
    try {
        const { department, semester, subject, type, search, limit, page } = req.query;
        
        // Build query object
        const query = {};
        
        if (department) {
            query.department = department;
        }
        if (semester) {
            query.semester = parseInt(semester);
        }
        if (type) {
            query.type = type;
        }
        if (subject) {
            query.subject = { $regex: subject, $options: 'i' };
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 100;
        const skip = (pageNum - 1) * limitNum;

        // Execute query with sorting
        const materials = await Material.find(query)
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip(skip)
            .lean();

        // Format response with id field
        const formattedMaterials = materials.map(material => ({
            id: material._id.toString(),
            _id: material._id.toString(),
            ...material
        }));
        
        res.json(formattedMaterials);
    } catch (error) {
        console.error('❌ Get materials error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get Single Material
app.get('/api/materials/:id', authMiddleware, async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        
        if (!material) {
            return res.status(404).json({ error: 'Material not found' });
        }

        res.json({
            id: material._id.toString(),
            ...material.toJSON()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Like Material
app.post('/api/materials/:id/like', authMiddleware, async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        
        if (!material) {
            return res.status(404).json({ error: 'Material not found' });
        }

        const userId = new mongoose.Types.ObjectId(req.user.userId);
        const likeIndex = material.likes.findIndex(
            likeId => likeId.toString() === userId.toString()
        );
        
        if (likeIndex > -1) {
            material.likes.splice(likeIndex, 1);
        } else {
            material.likes.push(userId);
        }

        await material.save();
        res.json({ 
            message: 'Like updated', 
            likes: material.likes.length,
            isLiked: material.likes.some(likeId => likeId.toString() === userId.toString())
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Download Material
app.post('/api/materials/:id/download', authMiddleware, async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        
        if (!material) {
            return res.status(404).json({ error: 'Material not found' });
        }

        material.downloads = (material.downloads || 0) + 1;
        await material.save();

        res.json({ 
            message: 'Download count updated', 
            downloads: material.downloads 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Material (Faculty only)
app.delete('/api/materials/:id', authMiddleware, facultyOnly, async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        
        if (!material) {
            return res.status(404).json({ error: 'Material not found' });
        }

        await Material.findByIdAndDelete(req.params.id);

        res.json({ message: 'Material deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// AI Chatbot
app.post('/api/chat', authMiddleware, async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Simple keyword-based responses (Backend Processing)
        let response = '';
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('pyq') || lowerMessage.includes('previous year') || lowerMessage.includes('question paper')) {
            response = 'You can find previous year question papers in the Materials section. Filter by "PYQ" type to see all available papers. Would you like me to help you find papers for a specific subject?';
        } else if (lowerMessage.includes('notes') || lowerMessage.includes('study material')) {
            response = 'Study notes are available in the Materials section. You can filter by subject, semester, and department to find relevant notes for your courses. Just click on Materials in the navigation menu!';
        } else if (lowerMessage.includes('syllabus')) {
            response = 'Syllabus documents are available in the Materials section. Filter by "Syllabus" type to view the curriculum for different courses. This will help you plan your studies better!';
        } else if (lowerMessage.includes('exam') || lowerMessage.includes('preparation')) {
            response = 'I can help you with exam preparation! We have notes, PYQs, and reference materials. What subject are you preparing for? I can guide you to the right materials.';
        } else if (lowerMessage.includes('download') || lowerMessage.includes('how to download')) {
            response = 'To download materials: 1) Go to the Materials page, 2) Find the document you need using filters or search, 3) Click the green "Download" button. Make sure you\'re logged in!';
        } else if (lowerMessage.includes('upload')) {
            response = 'Only faculty members can upload materials. If you\'re a faculty member, use the Upload button in the navigation menu to share notes, PYQs, or other study materials with students.';
        } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            response = 'Hello! 👋 I\'m your AI study assistant. I can help you find study materials, PYQs, and answer questions about using the portal. What would you like to know?';
        } else if (lowerMessage.includes('thank')) {
            response = 'You\'re welcome! 😊 Feel free to ask if you need any other help with your studies or using the portal.';
        } else {
            response = 'I\'m here to help with your academic queries! You can ask me about:\n• Finding study materials and notes\n• Previous year question papers (PYQs)\n• Exam preparation tips\n• How to download or upload materials\n• Using the portal features\n\nWhat would you like to know?';
        }

        // Save chat history
        await Chat.create({
            userId: req.user.userId,
            message,
            response
        });

        res.json({ response });
    } catch (error) {
        console.error('❌ Chat error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get Chat History
app.get('/api/chat/history', authMiddleware, async (req, res) => {
    try {
        const history = await Chat.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        
        const formattedHistory = history.map(chat => ({
            id: chat._id.toString(),
            ...chat
        }));
        
        res.json(formattedHistory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Dashboard Data (Pre-processed on Backend)
app.get('/api/dashboard', authMiddleware, async (req, res) => {
    try {
        // Get all materials for processing
        const materials = await Material.find().lean();
        
        // Calculate stats on backend
        const totalMaterials = materials.length;
        const totalPYQs = materials.filter(m => m.type === 'pyq').length;
        const totalDownloads = materials.reduce((sum, m) => sum + (m.downloads || 0), 0);
        
        // Get user counts
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalFaculty = await User.countDocuments({ role: 'faculty' });
        
        // Get recent materials (already sorted by date)
        const recentMaterials = materials
            .slice(0, 5)
            .map(m => ({
                id: m._id.toString(),
                title: m.title,
                subject: m.subject,
                type: m.type,
                createdAt: m.createdAt
            }));
        
        res.json({
            stats: {
                totalMaterials,
                totalPYQs,
                totalDownloads,
                totalStudents,
                totalFaculty
            },
            recentMaterials
        });
    } catch (error) {
        console.error('❌ Dashboard error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get Statistics
app.get('/api/stats', authMiddleware, async (req, res) => {
    try {
        const totalMaterials = await Material.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalFaculty = await User.countDocuments({ role: 'faculty' });
        
        const materials = await Material.find().lean();
        const totalDownloads = materials.reduce((sum, m) => sum + (m.downloads || 0), 0);
        
        res.json({
            totalMaterials,
            totalStudents,
            totalFaculty,
            totalDownloads
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('\n========================================');
    console.log('🚀 Exam Portal Backend Server Started!');
    console.log('========================================');
    console.log(`📍 Server running on: http://localhost:${PORT}`);
    console.log(`✅ Using MONGODB storage`);
    console.log('========================================\n');
});
