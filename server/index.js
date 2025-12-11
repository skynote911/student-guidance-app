import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import analyzeRoutes from './routes/analyze.js';
import attendanceRoutes from './routes/attendance.js';
import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // 10MB limit for file uploads/bulk data
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: true,
        message: '요청하신 경로를 찾을 수 없습니다.'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: true,
        message: '서버 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Database connection
async function connectDB() {
    try {
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            console.warn('⚠️  MONGODB_URI not set. Running without database.');
            console.warn('   Please check your .env file in the server directory.');
            return;
        }

        console.log('🔄 Attempting to connect to MongoDB...');
        console.log(`   URI: ${mongoUri.substring(0, 30)}...`);

        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000, // 10초 타임아웃
            socketTimeoutMS: 45000,
            family: 4, // Force IPv4
        });
        console.log('✅ MongoDB connected successfully');

    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.error('   Error details:', error);
        console.warn('⚠️  Server will run without database functionality');
        console.warn('   Login and database features will not work.');
    }
}

// Start server
async function startServer() {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/health`);
        console.log(`\n📝 API Endpoints:`);
        console.log(`   POST /api/auth/register - Teacher registration`);
        console.log(`   POST /api/auth/login - Teacher login`);
        console.log(`   GET  /api/auth/me - Get current teacher`);
        console.log(`   POST /api/analyze - Analyze student behavior`);
        console.log(`   GET  /api/analyze/incidents - Get all incidents`);
        console.log(`   GET  /api/analyze/incidents/:id - Get specific incident\n`);
    });
}

startServer();
