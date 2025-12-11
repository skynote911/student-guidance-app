/**
 * 마스터 계정 비밀번호 재설정 스크립트
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Teacher from './models/Teacher.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const resetMasterPassword = async () => {
    try {
        // MongoDB 연결
        const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://9seimwol_db_user:Ekf0SWSu9zLTMr4J@cluster0.1fe7uah.mongodb.net/student-guidance?retryWrites=true&w=majority';
        
        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB 연결 성공');

        // 마스터 계정 찾기
        const masterTeacher = await Teacher.findOne({ email: 'master@school.com' });
        
        if (!masterTeacher) {
            console.log('❌ 마스터 계정을 찾을 수 없습니다. 계정을 생성합니다...');
            
            // 새 계정 생성 (평문 비밀번호로 저장하면 pre-save hook이 자동으로 해시함)
            const newTeacher = new Teacher({
                email: 'master@school.com',
                password: 'master123!', // 평문으로 저장 (pre-save hook이 해시함)
                name: '마스터 교사',
                schoolLevel: 'all',
                role: 'teacher'
            });

            await newTeacher.save();
            console.log('✅ 마스터 계정이 생성되었습니다!');
        } else {
            console.log('✅ 마스터 계정을 찾았습니다. 비밀번호를 재설정합니다...');
            
            // 비밀번호 재설정 (평문으로 저장하면 pre-save hook이 자동으로 해시함)
            masterTeacher.password = 'master123!'; // 평문으로 저장
            await masterTeacher.save();
            console.log('✅ 비밀번호가 재설정되었습니다!');
        }

        // 비밀번호 검증 테스트
        const testTeacher = await Teacher.findOne({ email: 'master@school.com' });
        const isMatch = await bcrypt.compare('master123!', testTeacher.password);
        
        if (isMatch) {
            console.log('✅ 비밀번호 검증 성공!');
        } else {
            console.log('❌ 비밀번호 검증 실패!');
        }

        console.log('\n📋 로그인 정보:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 이메일: master@school.com');
        console.log('🔑 비밀번호: master123!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        await mongoose.disconnect();
        console.log('✅ 완료');

    } catch (error) {
        console.error('❌ 오류 발생:', error.message);
        process.exit(1);
    }
};

resetMasterPassword();

