import express from 'express';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
import fs from 'fs';
import path from 'path';

const logToFile = (message) => {
    try {
        fs.appendFileSync(path.join(process.cwd(), 'debug.log'), `${new Date().toISOString()} - ${message}\n`);
    } catch (e) {
        console.error('Logging failed', e);
    }
};

/**
 * GET /api/attendance/students
 * Get all students for the current teacher
 */
router.get('/students', authenticate, async (req, res) => {
    try {
        console.log(`Getting students for teacher: ${req.teacherId}, role: ${req.teacher.role}`);
        // Offline Mode
        if (req.teacherId === 'mock_teacher_id') {
            return res.json({
                success: true,
                students: []
            });
        }

        let query = { teacherId: req.teacherId };
        if (req.teacher.role === 'admin') {
            // Admin sees all students with teacher info
            const students = await Student.find({})
                .populate('teacherId', 'name email schoolLevel')
                .sort({ 'teacherId.name': 1, name: 1 });
            console.log(`Admin found ${students.length} students`);
            return res.json({ success: true, students });
        }

        const students = await Student.find({ teacherId: req.teacherId }).sort({ name: 1 });
        console.log(`Found ${students.length} students`);
        res.json({ success: true, students });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: true, message: '학생 목록을 불러오는 중 오류가 발생했습니다.' });
    }
});

/**
 * POST /api/attendance/students
 * Add a new student
 */
router.post('/students', authenticate, async (req, res) => {
    try {
        console.log('📝 Registering student:', req.body);
        console.log('   Teacher ID:', req.teacherId);
        logToFile(`Registering student: ${JSON.stringify(req.body)} for teacher ${req.teacherId}`);
        const { name, studentId } = req.body;

        // Offline Mode
        if (req.teacherId === 'mock_teacher_id') {
            console.log('⚠️ Offline mode detected during registration');
            return res.json({
                success: true,
                student: {
                    _id: `mock_s_${Date.now()}`,
                    name,
                    studentId,
                    mileage: 0,
                    teacherId: 'mock_teacher_id'
                }
            });
        }

        // Check if studentId already exists for this teacher
        const existingStudent = await Student.findOne({ teacherId: req.teacherId, studentId });
        if (existingStudent) {
            console.log('❌ Duplicate student ID:', studentId);
            return res.status(400).json({ error: true, message: '이미 등록된 학번입니다.' });
        }

        const student = new Student({
            name,
            studentId,
            teacherId: req.teacherId
        });

        await student.save();
        console.log('✅ Student saved:', student);
        res.json({ success: true, student });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ error: true, message: '학생 등록 중 오류가 발생했습니다.' });
    }
});

/**
 * POST /api/attendance/students/bulk
 * Add multiple students
 */
router.post('/students/bulk', authenticate, async (req, res) => {
    try {
        const { students } = req.body; // Array of { name, studentId }

        if (!students || !Array.isArray(students)) {
            return res.status(400).json({ error: true, message: '잘못된 데이터 형식입니다.' });
        }

        console.log(`📝 Bulk registering ${students.length} students for teacher ${req.teacherId}`);

        // Mock mode support
        if (req.teacherId === 'mock_teacher_id') {
            return res.json({
                success: true,
                count: students.length,
                message: `${students.length}명의 학생이 등록되었습니다. (오프라인)`
            });
        }

        let successCount = 0;
        let failCount = 0;

        for (const s of students) {
            try {
                // Check duplicate
                const exists = await Student.findOne({ teacherId: req.teacherId, studentId: s.studentId });
                if (!exists) {
                    await Student.create({
                        name: s.name,
                        studentId: s.studentId,
                        teacherId: req.teacherId
                    });
                    successCount++;
                } else {
                    failCount++; // Skip duplicates
                }
            } catch (err) {
                console.error(`Failed to register student ${s.studentId}:`, err);
                failCount++;
            }
        }

        res.json({
            success: true,
            count: successCount,
            failCount,
            message: `${successCount}명의 학생이 등록되었습니다. (중복/실패 ${failCount}명)`
        });

    } catch (error) {
        console.error('Error in bulk registration:', error);
        res.status(500).json({ error: true, message: '일괄 등록 중 오류가 발생했습니다.' });
    }
});

/**
 * POST /api/attendance/students/bulk-delete
 * Delete multiple students
 */
router.post('/students/bulk-delete', authenticate, async (req, res) => {
    try {
        const { studentIds } = req.body; // Array of _ids

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ error: true, message: '삭제할 학생을 선택해주세요.' });
        }

        console.log(`🗑️ Bulk deleting ${studentIds.length} students for teacher ${req.teacherId}`);

        // Offline Mode
        if (req.teacherId === 'mock_teacher_id') {
            return res.json({
                success: true,
                count: studentIds.length,
                message: `${studentIds.length}명의 학생이 삭제되었습니다. (오프라인)`
            });
        }

        // Filter for specific teacher unless admin
        const query = { _id: { $in: studentIds } };
        if (req.teacher.role !== 'admin') {
            query.teacherId = req.teacherId;
        }

        const result = await Student.deleteMany(query);

        // Also delete associated attendance records
        await Attendance.deleteMany({ studentId: { $in: studentIds } });

        console.log(`✅ Deleted ${result.deletedCount} students`);

        res.json({
            success: true,
            count: result.deletedCount,
            message: `${result.deletedCount}명의 학생이 삭제되었습니다.`
        });

    } catch (error) {
        console.error('Error in bulk delete:', error);
        res.status(500).json({ error: true, message: '일괄 삭제 중 오류가 발생했습니다.' });
    }
});

/**
 * POST /api/attendance/students/bulk-promote
 * Bulk update student IDs (Promotion)
 */
router.post('/students/bulk-promote', authenticate, async (req, res) => {
    try {
        const { promotions } = req.body; // Array of { id: _id, newStudentId: string }

        if (!promotions || !Array.isArray(promotions) || promotions.length === 0) {
            return res.status(400).json({ error: true, message: '업데이트할 데이터가 없습니다.' });
        }

        console.log(`🆙 Bulk promoting ${promotions.length} students for teacher ${req.teacherId}`);

        // Offline Mode
        if (req.teacherId === 'mock_teacher_id') {
            return res.json({
                success: true,
                count: promotions.length,
                message: `${promotions.length}명의 학생 정보가 업데이트되었습니다. (오프라인)`
            });
        }

        let successCount = 0;
        let failCount = 0;
        let unchangedCount = 0;

        for (const p of promotions) {
            try {
                // Check permissions and ownership
                let query = { _id: p.id };
                let targetTeacherId = req.teacherId;

                // If not admin, restrict to own students
                if (req.teacher.role !== 'admin') {
                    query.teacherId = req.teacherId;
                } else {
                    // For admin, we need to find the student first
                    const student = await Student.findById(p.id);
                    if (!student) {
                        failCount++;
                        console.log(`❌ Skipped ${p.id}: Student not found`);
                        continue;
                    }
                    targetTeacherId = student.teacherId;
                }

                // Check for duplicate ID within the target teacher's scope
                const existing = await Student.findOne({ teacherId: targetTeacherId, studentId: p.newStudentId });
                if (existing && existing._id.toString() !== p.id) {
                    console.log(`❌ Skipped ${p.newStudentId}: ID already taken by ${existing.name}`);
                    failCount++;
                    continue;
                }

                const result = await Student.updateOne(
                    query,
                    { $set: { studentId: p.newStudentId } }
                );

                if (result.modifiedCount > 0) {
                    successCount++;
                } else if (result.matchedCount > 0) {
                    unchangedCount++;
                    console.log(`⚠️ Unchanged ${p.id}: New ID same as old ID`);
                } else {
                    failCount++;
                    console.log(`❌ Failed to update student ${p.id}. Matched: ${result.matchedCount}`);
                }
            } catch (err) {
                console.error(`Failed to promote student ${p.id}:`, err);
                failCount++;
            }
        }

        res.json({
            success: true,
            count: successCount,
            failCount,
            unchangedCount,
            message: `${successCount}명의 학생이 업데이트되었습니다. (변경없음 ${unchangedCount}, 실패/중복 ${failCount})`
        });

    } catch (error) {
        console.error('Error in bulk promotion:', error);
        res.status(500).json({ error: true, message: '일괄 승급 중 오류가 발생했습니다.' });
    }
});

/**
 * POST /api/attendance
 * Mark attendance
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { studentId, date, status } = req.body;

        // Offline Mode
        if (req.teacherId === 'mock_teacher_id') {
            return res.json({
                success: true,
                attendance: {
                    studentId,
                    date,
                    status,
                    teacherId: 'mock_teacher_id'
                },
                currentMileage: status === 'PRESENT' ? 1 : 0
            });
        }

        // Find existing record
        let attendance = await Attendance.findOne({ studentId, date });
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({ error: true, message: '학생을 찾을 수 없습니다.' });
        }

        let mileageChange = 0;

        if (attendance) {
            // Update existing record
            if (attendance.status === 'PRESENT' && status !== 'PRESENT') {
                mileageChange = -1;
            } else if (attendance.status !== 'PRESENT' && status === 'PRESENT') {
                mileageChange = 1;
            }
            attendance.status = status;
            await attendance.save();
        } else {
            // Create new record
            attendance = new Attendance({
                studentId,
                teacherId: req.teacherId,
                date,
                status
            });
            await attendance.save();

            if (status === 'PRESENT') {
                mileageChange = 1;
            }
        }

        // Update mileage if changed
        if (mileageChange !== 0) {
            student.mileage += mileageChange;
            // Prevent negative mileage
            if (student.mileage < 0) student.mileage = 0;
            await student.save();
        }

        res.json({ success: true, attendance, currentMileage: student.mileage });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ error: true, message: '출결 처리 중 오류가 발생했습니다.' });
    }
});

/**
 * GET /api/attendance/history/:studentId
 * Get attendance history for a student
 */
router.get('/history/:studentId', authenticate, async (req, res) => {
    try {
        const { studentId } = req.params;
        // Get last 30 days
        const history = await Attendance.find({ studentId })
            .sort({ date: 1 })
            .limit(30);

        res.json({ success: true, history });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: true, message: '출결 기록을 불러오는 중 오류가 발생했습니다.' });
    }
});

/**
 * PUT /api/attendance/students/:id
 * Update student details
 */
router.put('/students/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, studentId } = req.body;

        // Offline Mode
        if (req.teacherId === 'mock_teacher_id') {
            return res.json({
                success: true,
                student: {
                    _id: id,
                    name,
                    studentId,
                    mileage: 0,
                    teacherId: 'mock_teacher_id'
                }
            });
        }

        // Check if student exists and belongs to teacher
        const student = await Student.findOne({ _id: id, teacherId: req.teacherId });
        if (!student) {
            return res.status(404).json({ error: true, message: '학생을 찾을 수 없습니다.' });
        }

        // Check for duplicate studentId if it's being changed
        if (studentId !== student.studentId) {
            const existingStudent = await Student.findOne({ teacherId: req.teacherId, studentId });
            if (existingStudent) {
                return res.status(400).json({ error: true, message: '이미 등록된 학번입니다.' });
            }
        }

        student.name = name;
        student.studentId = studentId;
        await student.save();

        res.json({ success: true, student });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ error: true, message: '학생 정보 수정 중 오류가 발생했습니다.' });
    }
});

/**
 * DELETE /api/attendance/students/:id
 * Delete a student
 */
router.delete('/students/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        // Offline Mode
        if (req.teacherId === 'mock_teacher_id') {
            return res.json({ success: true, message: '학생이 삭제되었습니다. (오프라인)' });
        }

        const student = await Student.findOneAndDelete({ _id: id, teacherId: req.teacherId });
        if (!student) {
            return res.status(404).json({ error: true, message: '학생을 찾을 수 없습니다.' });
        }

        // Optionally delete associated attendance records
        await Attendance.deleteMany({ studentId: id });

        res.json({ success: true, message: '학생이 삭제되었습니다.' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ error: true, message: '학생 삭제 중 오류가 발생했습니다.' });
    }
});

export default router;
