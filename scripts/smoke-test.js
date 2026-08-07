const http = require('http');

const SERVICES = [
  { name: 'auth-service', port: 3001 },
  { name: 'user-service', port: 3002 },
  { name: 'course-service', port: 3003 },
  { name: 'attendance-service', port: 3004 },
  { name: 'assessment-service', port: 3005 },
  { name: 'analytics-service', port: 3006 },
  { name: 'notification-service', port: 3007 },
  { name: 'discussion-service', port: 3008 },
  { name: 'library-service', port: 3009 },
  { name: 'placement-service', port: 3010 },
  { name: 'timetable-service', port: 3011 },
  { name: 'calendar-service', port: 3012 },
  { name: 'assignment-service', port: 3013 },
  { name: 'admin-service', port: 3014 },
  { name: 'certificate-service', port: 3015 },
];

function checkService(service) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${service.port}/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode === 200 && parsed.status === 'ok') {
            resolve({ name: service.name, status: 'UP', port: service.port });
          } else {
            resolve({ name: service.name, status: 'DEGRADED', port: service.port, response: data });
          }
        } catch (e) {
          resolve({ name: service.name, status: 'INVALID_JSON', port: service.port, raw: data });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ name: service.name, status: 'DOWN', port: service.port, error: err.message });
    });

    req.setTimeout(2000, () => {
      req.destroy();
      resolve({ name: service.name, status: 'TIMEOUT', port: service.port });
    });
  });
}

async function runSmokeTest() {
  console.log('=====================================================');
  console.log(' EduSphere Microservice Infrastructure Smoke Test');
  console.log('=====================================================\n');

  const results = await Promise.all(SERVICES.map(checkService));
  
  let passed = 0;
  results.forEach(r => {
    const icon = r.status === 'UP' ? '✅' : '❌';
    console.log(`${icon} [${r.name}] on port ${r.port}: ${r.status}`);
    if (r.status === 'UP') passed++;
  });

  console.log(`\nResults: ${passed} / ${SERVICES.length} services reachable and healthy.`);
  process.exit(passed === SERVICES.length ? 0 : 1);
}

runSmokeTest();
