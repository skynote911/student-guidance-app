import express from 'express';
import bcrypt from 'bcryptjs';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/admin/teachers
 * List all teachers
 */
router.get('/teachers', authenticate, requireAdmin, async (req, res) => {
    try {
        const teachers = await Teacher.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, teachers });
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ error: true, message: '선생님 목록을 불러오는 중 오류가 발생했습니다.' });
    }
});

/**
 * DELETE /api/admin/teachers/:id
 * Delete a teacher and their data
 */
router.delete('/teachers/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting self
        if (id === req.teacherId.toString()) {
            return res.status(400).json({ error: true, message: '자신의 계정은 삭제할 수 없습니다.' });
        }

        const teacher = await Teacher.findByIdAndDelete(id);
        if (!teacher) {
            return res.status(404).json({ error: true, message: '선생님을 찾을 수 없습니다.' });
        }

        // Cleanup associated data
        await Student.deleteMany({ teacherId: id });
        await Attendance.deleteMany({ teacherId: id });

        res.json({ success: true, message: '계정이 삭제되었습니다.' });
    } catch (error) {
        console.error('Error deleting teacher:', error);
        res.status(500).json({ error: true, message: '계정 삭제 중 오류가 발생했습니다.' });
    }
});

/**
 * POST /api/admin/teachers/:id/reset-password
 * Reset teacher's password
 */
router.post('/teachers/:id/reset-password', authenticate, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const teacher = await Teacher.findById(id);

        if (!teacher) {
            return res.status(404).json({ error: true, message: '선생님을 찾을 수 없습니다.' });
        }

        // Default password: 'daily' + current year (e.g., daily2024) - or just '123456' as requested
        // Let's stick to '123456' for simplicity as requested
        const tempPassword = '123456';

        // Hash isn't needed here if we assign directly? No, Mongoose middleware handles hashing on save
        // ONLY if the field is modified.
        teacher.password = tempPassword;
        await teacher.save();

        res.json({ success: true, message: '비밀번호가 123456으로 초기화되었습니다.' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: true, message: '비밀번호 초기화 중 오류가 발생했습니다.' });
    }
});

export default router;
