/**
 * EduSphere Enterprise — Infrastructure Smoke Test
 * Tests all 15 microservices' /health endpoints.
 *
 * Usage:
 *   node backend/scripts/smoke-test.js           # Direct service ports
 *   node backend/scripts/smoke-test.js --gateway  # Through nginx gateway on port 80
 */

const http = require('http');

const net = require('net');

const USE_GATEWAY = process.argv.includes('--gateway');

async function checkInfrastructure(host, port, name) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(2000);
    socket.on('connect', () => {
      socket.destroy();
      resolve({ name, status: 'UP' });
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ name, status: 'DOWN', error: 'Timeout' });
    });
    socket.on('error', (err) => {
      socket.destroy();
      resolve({ name, status: 'DOWN', error: err.message });
    });
    socket.connect(port, host);
  });
}

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
  { name: 'finance-service',      port: 3016, gatewayPath: '/api/finance/health' },
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

  console.log('--- Checking Core Infrastructure ---');

  // 1. MongoDB Check
  let mongoCheck;
  if (process.env.MONGO_URI) {
    try {
      const mongoose = require('mongoose');
      await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 4000 });
      await mongoose.disconnect();
      mongoCheck = { status: 'UP' };
    } catch (err) {
      mongoCheck = { status: 'DOWN', error: err.message };
    }
  } else {
    mongoCheck = await checkInfrastructure('127.0.0.1', 27017, 'MongoDB');
  }

  if (mongoCheck.status === 'UP') {
    console.log('✅ [MongoDB]: UP');
  } else {
    console.log(`❌ [MongoDB]: DOWN (${mongoCheck.error || 'Connection failed'})`);
    console.log('\nFATAL: MongoDB is unreachable. The microservices will crash instantly.');
    console.log('Please start MongoDB or configure MONGO_URI in .env.');
    process.exit(1);
  }

  // 2. RabbitMQ Check
  let rabbitCheck;
  if (process.env.RABBITMQ_URL) {
    try {
      const url = new URL(process.env.RABBITMQ_URL);
      const port = url.port || (url.protocol === 'amqps:' ? 5671 : 5672);
      rabbitCheck = await checkInfrastructure(url.hostname, parseInt(port, 10), 'RabbitMQ');
    } catch (err) {
      rabbitCheck = { status: 'DOWN', error: err.message };
    }
  } else {
    rabbitCheck = await checkInfrastructure('127.0.0.1', 5672, 'RabbitMQ');
  }

  if (rabbitCheck.status === 'UP') {
    console.log('✅ [RabbitMQ]: UP');
  } else {
    console.log(`❌ [RabbitMQ]: DOWN (${rabbitCheck.error || 'Connection failed'})`);
  }

  // 3. Redis Check
  let redisCheck;
  if (process.env.REDIS_URL) {
    try {
      const url = new URL(process.env.REDIS_URL);
      const port = url.port || (url.protocol === 'rediss:' ? 6380 : 6379);
      redisCheck = await checkInfrastructure(url.hostname, parseInt(port, 10), 'Redis');
    } catch (err) {
      redisCheck = { status: 'DOWN', error: err.message };
    }
  } else {
    redisCheck = await checkInfrastructure('127.0.0.1', 6379, 'Redis');
  }

  if (redisCheck.status === 'UP') {
    console.log('✅ [Redis]: UP');
  } else {
    console.log(`❌ [Redis]: DOWN (${redisCheck.error || 'Connection failed'})`);
  }

  console.log('\n--- Checking Microservices ---');
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
