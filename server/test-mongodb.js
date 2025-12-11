import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        
        if (!mongoUri) {
            console.error('❌ MONGODB_URI가 설정되지 않았습니다.');
            process.exit(1);
        }
        
        console.log('🔄 MongoDB 연결 시도 중...');
        console.log(`   URI: ${mongoUri.substring(0, 50)}...`);
        
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        
        console.log('✅ MongoDB 연결 성공!');
        console.log(`   데이터베이스: ${mongoose.connection.db.databaseName}`);
        console.log(`   상태: ${mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'}`);
        
        await mongoose.disconnect();
        console.log('✅ 연결 종료됨');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ MongoDB 연결 실패:');
        console.error(`   오류: ${error.message}`);
        if (error.name === 'MongoServerSelectionError') {
            console.error('   네트워크 연결 문제 또는 MongoDB 서버에 접근할 수 없습니다.');
        }
        process.exit(1);
    }
};

testConnection();
