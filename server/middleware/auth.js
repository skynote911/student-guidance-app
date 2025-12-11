import jwt from 'jsonwebtoken';
import Teacher from '../models/Teacher.js';

/**
 * Middleware to verify JWT token and authenticate requests
 */
export const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: true,
                message: '인증 토큰이 필요합니다.'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_fallback_secret');

        // Handle Mock Login (Offline Mode)
        if (decoded.id === 'mock_teacher_id') {
            req.teacher = {
                _id: 'mock_teacher_id',
                email: 'test@example.com',
                name: '테스트 교사',
                role: 'teacher',
                schoolLevel: 'elementary'
            };
            req.teacherId = 'mock_teacher_id';
            return next();
        }

        // Get teacher from database
        const teacher = await Teacher.findById(decoded.id).select('-password');

        if (!teacher) {
            return res.status(401).json({
                error: true,
                message: '유효하지 않은 토큰입니다.'
            });
        }

        // Attach teacher to request object
        req.teacher = teacher;
        req.teacherId = teacher._id;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: true,
                message: '유효하지 않은 토큰입니다.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: true,
                message: '토큰이 만료되었습니다. 다시 로그인해주세요.'
            });
        }

        console.error('Authentication error:', error);
        res.status(500).json({
            error: true,
            message: '인증 처리 중 오류가 발생했습니다.'
        });
    }
};

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (req, res, next) => {
    if (req.teacher.role !== 'admin') {
        return res.status(403).json({
            error: true,
            message: '관리자 권한이 필요합니다.'
        });
    }
    next();
};
