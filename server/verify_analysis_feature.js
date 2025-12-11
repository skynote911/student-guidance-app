
import http from 'http';

const TEST_USER = {
    email: 'verify_test@example.com',
    password: 'password123',
    name: 'VerificationBot',
    schoolLevel: 'elementary'
};

function request(path, method, body, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '127.0.0.1',
            port: 3000,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data);
                    }
                } else {
                    reject(new Error(`Status ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function verify() {
    console.log('🚀 Starting Verification (Native HTTP)...');

    try {
        // 1. Login
        console.log('🔑 Attempting login...');
        let token;
        try {
            const loginData = await request('/auth/login', 'POST', {
                email: TEST_USER.email,
                password: TEST_USER.password
            });
            console.log('✅ Login successful');
            token = loginData.token;
        } catch (e) {
            console.log('⚠️ Login failed, attempting registration...');
            const regData = await request('/auth/register', 'POST', TEST_USER);
            console.log('✅ Registration successful');
            token = regData.token;
        }

        // 2. Analyze
        console.log('🧠 Testing Analysis API...');
        const analyzeData = await request('/analyze', 'POST', {
            text: '철수가 점심시간에 급식실에서 새치기를 하다가 영희를 밀쳤어.',
            studentId: 'unknown',
            saveToDb: false
        }, token);

        console.log('✅ Analysis successful!');
        console.log('Result:', JSON.stringify(analyzeData.analysis, null, 2));

    } catch (error) {
        console.error('❌ Verification Failed:', error.message);
        process.exit(1);
    }
}

verify();
