const fs = require('fs');

// Update nginx.conf
let nginxConf = fs.readFileSync('backend/gateway/nginx.conf', 'utf8');

if (!nginxConf.includes('upstream finance_service')) {
  nginxConf = nginxConf.replace(
    'upstream admin_service        { server es_admin:3015; }',
    'upstream admin_service        { server es_admin:3015; }\n  upstream finance_service      { server es_finance:3016; }'
  );
}

if (!nginxConf.includes('location /api/finance/')) {
  const adminLocation = `# Admin Service — /api/admin/
    location /api/admin/ {
      limit_req zone=api burst=20;
      proxy_pass         http://admin_service/;
      proxy_set_header   Host $host;
      proxy_set_header   X-Real-IP $remote_addr;
    }`;
    
  const newLocations = `${adminLocation}

    # Finance Service — /api/finance/
    location /api/finance/ {
      limit_req zone=api burst=20;
      proxy_pass         http://finance_service/;
      proxy_set_header   Host $host;
      proxy_set_header   X-Real-IP $remote_addr;
    }`;
    
  nginxConf = nginxConf.replace(adminLocation, newLocations);
}

fs.writeFileSync('backend/gateway/nginx.conf', nginxConf);

// Update docker-compose.yml
let compose = fs.readFileSync('infra/docker-compose.yml', 'utf8');
if (!compose.includes('finance-service:')) {
  const adminService = `  admin-service:
    build: ../backend/services/admin-service
    container_name: es_admin
    restart: unless-stopped
    ports: ["3015:3015"]
    environment:
      - NODE_ENV=production
      - PORT=3015
      - MONGO_URI=mongodb://admin:admin@mongo:27017/edusphere_admin?authSource=admin
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=edusphere_super_secret_key_2025
    depends_on:
      mongo: { condition: service_healthy }
      redis: { condition: service_healthy }
    networks: [edusphere_net]`;
    
  const financeService = `\n\n  finance-service:
    build: ../backend/services/finance-service
    container_name: es_finance
    restart: unless-stopped
    ports: ["3016:3016"]
    environment:
      - NODE_ENV=production
      - PORT=3016
      - MONGO_URI=mongodb://admin:admin@mongo:27017/edusphere_finance?authSource=admin
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
      - JWT_SECRET=edusphere_super_secret_key_2025
    depends_on:
      mongo: { condition: service_healthy }
      rabbitmq: { condition: service_healthy }
    networks: [edusphere_net]`;
    
  compose = compose.replace(adminService, adminService + financeService);
  
  compose = compose.replace(
    'admin-service:        { condition: service_healthy }',
    'admin-service:        { condition: service_healthy }\n        finance-service:      { condition: service_healthy }'
  );
  fs.writeFileSync('infra/docker-compose.yml', compose);
}

console.log('Success Nginx and DockerCompose updated');
