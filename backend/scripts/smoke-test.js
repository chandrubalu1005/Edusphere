/**
 * EduSphere Enterprise — Infrastructure Smoke Test
 * Tests all 15 microservices' /health endpoints.
 *
 * Usage:
 *   node backend/scripts/smoke-test.js           # Direct service ports
 *   node backend/scripts/smoke-test.js --gateway  # Through nginx gateway on port 80
 */

const http = require('http');

const USE_GATEWAY = process.argv.includes('--gateway');

// Correct port → service mapping (verified against each service's server.js PORT fallback)
const SERVICES = [
  { name: 'auth-service',         port: 3001, gatewayPath: '/api/auth/health' },
  { name: 'user-service',         port: 3002, gatewayPath: '/api/users/health' },
  { name: 'course-service',       port: 3003, gatewayPath: '/api/courses/health' },
  { name: 'notification-service', port: 3004, gatewayPath: '/api/notifications/health' },
  { name: 'assessment-service',   port: 3005, gatewayPath: '/api/assessments/health' },
  { name: 'assignment-service',   port: 3006, gatewayPath: '/api/assignments/health' },
  { name: 'certificate-service',  port: 3007, gatewayPath: '/api/certificates/health' },
  { name: 'attendance-service',   port: 3008, gatewayPath: '/api/attendance/health' },
  { name: 'timetable-service',    port: 3009, gatewayPath: '/api/timetable/health' },
  { name: 'calendar-service',     port: 3010, gatewayPath: '/api/calendar/health' },
  { name: 'library-service',      port: 3011, gatewayPath: '/api/library/health' },
  { name: 'placement-service',    port: 3012, gatewayPath: '/api/placement/health' },
  { name: 'discussion-service',   port: 3013, gatewayPath: '/api/discussion/health' },
  { name: 'analytics-service',    port: 3014, gatewayPath: '/api/analytics/health' },
  { name: 'admin-service',        port: 3015, gatewayPath: '/api/admin/health' },
];

function checkService(service) {
  return new Promise((resolve) => {
    const options = USE_GATEWAY
      ? { hostname: 'localhost', port: 80,          path: service.gatewayPath }
      : { hostname: 'localhost', port: service.port, path: '/health' };

    const req = http.get(options, (res) => {
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
          resolve({ name: service.name, status: 'INVALID_JSON', port: service.port, raw: data.substring(0, 100) });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ name: service.name, status: 'DOWN', port: service.port, error: err.message });
    });

    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ name: service.name, status: 'TIMEOUT', port: service.port });
    });
  });
}

async function runSmokeTest() {
  const mode = USE_GATEWAY ? 'GATEWAY (port 80)' : 'DIRECT (service ports)';
  console.log('═══════════════════════════════════════════════════════');
  console.log(' EduSphere Microservice Infrastructure Smoke Test');
  console.log(` Mode: ${mode}`);
  console.log('═══════════════════════════════════════════════════════\n');

  const results = await Promise.all(SERVICES.map(checkService));

  let passed = 0;
  results.forEach(r => {
    const icon = r.status === 'UP' ? '✅' : '❌';
    const extra = r.error ? ` (${r.error})` : r.raw ? ` (${r.raw})` : '';
    console.log(`${icon} [${r.name}] port ${r.port}: ${r.status}${extra}`);
    if (r.status === 'UP') passed++;
  });

  console.log(`\nResults: ${passed} / ${SERVICES.length} services healthy.`);

  if (passed < SERVICES.length) {
    console.log('\nTip: Make sure all containers are running:');
    console.log('  docker compose -f infra/docker-compose.yml ps');
    process.exit(1);
  }

  process.exit(0);
}

runSmokeTest();
