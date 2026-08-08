# EduSphere Infrastructure — Local Dev Guide

## Quick Start

```bash
# From the repo root:
docker compose -f infra/docker-compose.yml up --build -d

# Seed all databases (after containers are healthy):
npm run seed

# Verify all services are healthy:
node backend/scripts/smoke-test.js

# Open http://localhost in your browser
```

---

## Database Reference

All 15 services use a **single MongoDB container** (`es_mongodb` on port 27017) with 15 **separate logical databases**. No service shares a database with another.

| # | Service | Container Name | Database Name | Port |
|---|---|---|---|---|
| 1 | auth-service | es_auth | `edusphere_auth` | 3001 |
| 2 | user-service | es_users | `edusphere_users` | 3002 |
| 3 | course-service | es_courses | `edusphere_courses` | 3003 |
| 4 | notification-service | es_notifications | `edusphere_notifications` | 3004 |
| 5 | assessment-service | es_assessments | `edusphere_assessments` | 3005 |
| 6 | assignment-service | es_assignments | `edusphere_assignments` | 3006 |
| 7 | certificate-service | es_certificates | `edusphere_certificates` | 3007 |
| 8 | attendance-service | es_attendance | `edusphere_attendance` | 3008 |
| 9 | timetable-service | es_timetable | `edusphere_timetable` | 3009 |
| 10 | calendar-service | es_calendar | `edusphere_calendar` | 3010 |
| 11 | library-service | es_library | `edusphere_library` | 3011 |
| 12 | placement-service | es_placement | `edusphere_placement` | 3012 |
| 13 | discussion-service | es_discussion | `edusphere_discussions` | 3013 |
| 14 | analytics-service | es_analytics | `edusphere_analytics` | 3014 |
| 15 | admin-service | es_admin | `edusphere_admin` | 3015 |

---

## Infrastructure Containers

| Container | Image | Port(s) | Named Volume |
|---|---|---|---|
| es_mongodb | mongo:7.0 | 27017 | `edusphere_mongo_data` |
| es_redis | redis:7.2-alpine | 6379 | `edusphere_redis_data` |
| es_rabbitmq | rabbitmq:3.12-management | 5672, 15672 | `edusphere_rabbitmq_data` |
| es_meilisearch | getmeili/meilisearch:v1.4 | 7700 | `edusphere_meilisearch_data` |
| es_minio | minio/minio:latest | 9000, 9001 | `edusphere_minio_data` |
| es_gateway | nginx:1.25-alpine | 80 | — |
| es_frontend | edusphere/frontend | — | — |
| es_prometheus | prom/prometheus:v2.45.0 | 9090 | — |
| es_grafana | grafana/grafana:10.0.0 | 3000 | — |

**Volumes persist across `docker compose down`** — only deleted on `docker compose down -v`.

---

## Demo Accounts

All accounts use password: **`demo123`**

| Username | Role | Email |
|---|---|---|
| john_doe | Student | john_doe@edusphere.edu |
| jane_smith | Student | jane_smith@edusphere.edu |
| sarah_j | Faculty | sarah_j@edusphere.edu |
| prof_kumar | Faculty | prof_kumar@edusphere.edu |
| sys_admin | Admin | sys_admin@edusphere.edu |
| dean_academic | Management | dean_academic@edusphere.edu |

---

## Useful Commands

### Docker Compose

```bash
# Start everything (from repo root):
docker compose -f infra/docker-compose.yml up --build -d

# Or using npm script:
npm run docker:up

# View logs:
npm run docker:logs

# Check container health:
docker compose -f infra/docker-compose.yml ps

# Stop (preserves data volumes):
npm run docker:down

# Stop and wipe ALL data (destructive!):
docker compose -f infra/docker-compose.yml down -v
```

### Seed Data

```bash
# Seed all 15 databases (requires MongoDB to be running):
npm run seed

# Or directly:
node backend/scripts/seed.js
```

### Smoke Test

```bash
# Test all services directly (requires services to be running):
node backend/scripts/smoke-test.js

# Test through gateway (requires nginx on port 80):
node backend/scripts/smoke-test.js --gateway
```

---

## Local Database Dump & Restore

Use these commands to snapshot a known-good demo state (e.g., before a demo or presentation) and restore it later. This is a local convenience tool, NOT a production backup strategy.

### Dump All Databases

```bash
# Create a timestamped snapshot:
$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
docker exec es_mongodb mongodump --out /dump/$timestamp --quiet
docker cp es_mongodb:/dump/$timestamp ./infra/db-backups/$timestamp

Write-Host "Snapshot saved to ./infra/db-backups/$timestamp"
```

**Linux/macOS equivalent:**
```bash
timestamp=$(date +%Y%m%d_%H%M)
docker exec es_mongodb mongodump --out /dump/$timestamp --quiet
docker cp es_mongodb:/dump/$timestamp ./infra/db-backups/$timestamp
echo "Snapshot saved to ./infra/db-backups/$timestamp"
```

### Restore from a Snapshot

```bash
# Replace <snapshot_dir> with the folder name from your backup:
$snapshot = "20260808_1030"  # Example
docker cp ./infra/db-backups/$snapshot es_mongodb:/restore/$snapshot
docker exec es_mongodb mongorestore /restore/$snapshot --drop --quiet
Write-Host "Restored from snapshot $snapshot"
```

**Linux/macOS equivalent:**
```bash
snapshot="20260808_1030"
docker cp ./infra/db-backups/$snapshot es_mongodb:/restore/$snapshot
docker exec es_mongodb mongorestore /restore/$snapshot --drop --quiet
echo "Restored from snapshot $snapshot"
```

### Quick Restore to Seed State

If you just want to reset to the seed data state:

```bash
# Drop and re-seed (requires Docker stack running):
docker compose -f infra/docker-compose.yml exec mongodb mongosh --eval \
  "db.adminCommand({ listDatabases: 1 }).databases.filter(d => d.name.startsWith('edusphere_')).forEach(d => db.getSiblingDB(d.name).dropDatabase())"

npm run seed
```

---

## Service Architecture

```
Browser → http://localhost:80
              ↓
         [Nginx Gateway: es_gateway]
              ↓ /api/<service>/
         [Microservice: es_<name>:30XX]
              ↓
         [MongoDB: es_mongodb:27017/edusphere_<name>]
```

**Message Bus:** RabbitMQ (`es_rabbitmq:5672`, exchange: `domain_events`, pattern: `topic`)
- Producers: user-service, course-service, attendance-service, auth-service
- Consumers: notification-service, analytics-service

**Cache:** Redis (`es_redis:6379`)
- Used by: auth-service (sessions), assessment-service (quiz timers), attendance-service (QR codes)

---

## Troubleshooting

### Service keeps restarting
```bash
docker compose -f infra/docker-compose.yml logs <service-name> --tail=50
```

### MongoDB not ready before services
The healthcheck `depends_on: mongodb: { condition: service_healthy }` should prevent this, but if it happens, wait 30s and run:
```bash
docker compose -f infra/docker-compose.yml restart <service-name>
```

### Port already in use
Check what's using port 80 or 27017:
```powershell
netstat -ano | findstr :80
netstat -ano | findstr :27017
```

### Reset everything and start fresh
```bash
docker compose -f infra/docker-compose.yml down -v --remove-orphans
docker compose -f infra/docker-compose.yml up --build -d
npm run seed
```
