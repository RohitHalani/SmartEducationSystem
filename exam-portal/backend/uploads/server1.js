const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();


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


//studentRegi api
app.post('/api/auth/register',(req,res)=>{
try {
    const {name,email,password,role,department,semester}=req.body;
    // Validation
    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    
} catch (error) {
    
}

})
