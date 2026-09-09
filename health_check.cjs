const http = require('http');

const services = [
    { Name: "auth-service", Port: 3001 },
    { Name: "user-service", Port: 3002 },
    { Name: "course-service", Port: 3003 },
    { Name: "notification-service", Port: 3004 },
    { Name: "assessment-service", Port: 3005 },
    { Name: "assignment-service", Port: 3006 },
    { Name: "certificate-service", Port: 3007 },
    { Name: "attendance-service", Port: 3008 },
    { Name: "timetable-service", Port: 3009 },
    { Name: "calendar-service", Port: 3010 },
    { Name: "library-service", Port: 3011 },
    { Name: "placement-service", Port: 3012 },
    { Name: "discussion-service", Port: 3013 },
    { Name: "analytics-service", Port: 3014 },
    { Name: "admin-service", Port: 3015 },
    { Name: "finance-service", Port: 3016 }
];

async function checkHealth(service) {
    return new Promise((resolve) => {
        const req = http.get(`http://127.0.0.1:${service.Port}/health`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve({ name: service.Name, status: 'HEALTHY', port: service.Port, details: data });
                } else {
                    resolve({ name: service.Name, status: `UNHEALTHY (${res.statusCode})`, port: service.Port });
                }
            });
        });
        req.on('error', (e) => {
            resolve({ name: service.Name, status: 'DOWN', port: service.Port, error: e.message });
        });
        req.setTimeout(2000, () => {
            req.destroy();
            resolve({ name: service.Name, status: 'TIMEOUT', port: service.Port });
        });
    });
}

async function run() {
    const results = [];
    for (const svc of services) {
        const res = await checkHealth(svc);
        results.push(res);
        console.log(`${res.name.padEnd(25)} | Port ${res.port} | ${res.status}`);
    }
}
run();
