/**
 * 마스터 계정 생성 스크립트
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Teacher from './models/Teacher.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const createMasterAccount = async () => {
    try {
        // MongoDB 연결
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-guidance';
        
        if (!process.env.MONGODB_URI) {
            console.warn('⚠️  MONGODB_URI가 설정되지 않았습니다. 기본값을 사용합니다.');
        }

        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB 연결 성공');

        // 기존 마스터 계정 확인
        const existingMaster = await Teacher.findOne({ email: 'master@school.com' });
        if (existingMaster) {
            console.log('⚠️  마스터 계정이 이미 존재합니다.');
            console.log('📧 이메일: master@school.com');
            console.log('🔑 비밀번호: (기존 계정)');
            console.log('\n기존 계정을 삭제하고 새로 만들까요? (Y/N)');
            await mongoose.disconnect();
            return;
        }

        // 마스터 계정 생성
        const password = 'master123!';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const masterTeacher = new Teacher({
            email: 'master@school.com',
            password: hashedPassword,
            name: '마스터 교사',
            schoolLevel: 'all', // 모든 학교급 지원
            role: 'teacher'
        });

        await masterTeacher.save();

        console.log('\n✅ 마스터 계정이 생성되었습니다!\n');
        console.log('📋 로그인 정보:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 이메일: master@school.com');
        console.log('🔑 비밀번호: master123!');
        console.log('👤 이름: 마스터 교사');
        console.log('🏫 학교급: 모든 학교급 (초등/중등/고등)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('⚠️  보안을 위해 로그인 후 비밀번호를 변경하세요!\n');

        await mongoose.disconnect();
        console.log('✅ 완료');

    } catch (error) {
        console.error('❌ 오류 발생:', error.message);
        if (error.code === 11000) {
            console.log('⚠️  이미 존재하는 이메일입니다.');
        }
        process.exit(1);
    }
};

createMasterAccount();


