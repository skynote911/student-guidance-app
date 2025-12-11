import http from 'http';

const req = http.request({
    host: 'localhost',
    port: 3000,
    path: '/api/attendance/students/bulk-promote',
    method: 'POST'
}, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
