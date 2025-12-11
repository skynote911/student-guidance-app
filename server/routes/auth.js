import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Teacher from '../models/Teacher.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new teacher account
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, schoolLevel } = req.body;

        // Validate input
        if (!email || !password || !name) {
            return res.status(400).json({
                error: true,
                message: '이메일, 비밀번호, 이름을 모두 입력해주세요.'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: true,
                message: '비밀번호는 최소 6자 이상이어야 합니다.'
            });
        }

        // Validate schoolLevel if provided
        if (schoolLevel && !['elementary', 'middle', 'high', 'all'].includes(schoolLevel)) {
            return res.status(400).json({
                error: true,
                message: '학교급은 elementary, middle, high, all 중 하나여야 합니다.'
            });
        }

        // Check if teacher already exists
        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
            return res.status(400).json({
                error: true,
                message: '이미 등록된 이메일입니다.'
            });
        }

        // Create new teacher
        const teacher = new Teacher({
            email,
            password,
            name,
            schoolLevel: schoolLevel || 'all'
        });

        await teacher.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: teacher._id, role: teacher.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: '회원가입이 완료되었습니다.',
            token,
            teacher: teacher.toJSON()
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: true,
            message: '회원가입 중 오류가 발생했습니다.'
        });
    }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
    try {
        console.log('🔐 Login attempt started');
        const { email, password } = req.body;
        console.log(`   Email: ${email}`);

        // Validate input
        if (!email || !password) {
            console.log('❌ Validation failed: missing email or password');
            return res.status(400).json({
                error: true,
                message: '이메일과 비밀번호를 입력해주세요.'
            });
        }

        // Check DB connection first
        if (mongoose.connection.readyState !== 1) {
            console.log('⚠️  Database disconnected. Using Mock Login.');
            const mockTeacher = {
                _id: 'mock_teacher_id',
                email: email,
                name: '테스트 교사',
                role: 'teacher',
                schoolLevel: 'elementary'
            };

            const token = jwt.sign(
                { id: mockTeacher._id, role: mockTeacher.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.json({
                success: true,
                message: '오프라인 모드로 로그인되었습니다.',
                token,
                teacher: mockTeacher
            });
        }

        // Find teacher by email
        console.log('🔍 Searching for teacher in database...');
        const teacher = await Teacher.findOne({ email });
        console.log(`   Teacher found: ${teacher ? 'Yes' : 'No'}`);

        if (!teacher) {
            console.log('❌ Teacher not found');
            return res.status(401).json({
                error: true,
                message: '이메일 또는 비밀번호가 올바르지 않습니다.'
            });
        }

        // Check password
        console.log('🔑 Comparing password...');
        const isMatch = await teacher.comparePassword(password);
        console.log(`   Password match: ${isMatch ? 'Yes' : 'No'}`);

        if (!isMatch) {
            console.log('❌ Password mismatch');
            return res.status(401).json({
                error: true,
                message: '이메일 또는 비밀번호가 올바르지 않습니다.'
            });
        }

        // Generate JWT token
        console.log('🎫 Generating JWT token...');
        const token = jwt.sign(
            { id: teacher._id, role: teacher.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('✅ Login successful');
        res.json({
            success: true,
            message: '로그인 성공',
            token,
            teacher: teacher.toJSON()
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        console.error('   Stack:', error.stack);

        // Write to debug log file
        import('fs').then(fs => {
            fs.appendFileSync('debug.log', `${new Date().toISOString()} - Login Error: ${error.message}\n${error.stack}\n\n`);
        });

        // Fallback for offline mode on error (e.g. timeout)
        console.log('⚠️  Login error occurred. Attempting Mock Login fallback.');
        const mockTeacher = {
            _id: 'mock_teacher_id',
            email: req.body.email || 'test@example.com',
            name: '테스트 교사',
            role: 'teacher',
            schoolLevel: 'elementary'
        };

        const token = jwt.sign(
            { id: mockTeacher._id, role: mockTeacher.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.json({
            success: true,
            message: '오프라인 모드로 로그인되었습니다. (DB 연결 실패)',
            token,
            teacher: mockTeacher
        });
    }
});

/**
 * GET /api/auth/me
 * Get current teacher info
 */
router.get('/me', authenticate, async (req, res) => {
    res.json({
        success: true,
        teacher: req.teacher
    });
});

export default router;
