# EduSphere Enterprise: LAN Deployment Architecture

## 1. Network Topology
EduSphere operates in a **Zero Trust** topology utilizing 4 isolated Docker networks:
- **`edge_net`**: Contains the NGINX Gateway exposing ports `80`/`443`.
- **`app_net`**: Microservices and the Frontend container. Isolated from host.
- **`data_net`**: MongoDB, Redis, RabbitMQ, Meilisearch, MinIO. Isolated from host and Gateway.
- **`observability_net`**: Prometheus and Grafana for system monitoring.

## 2. Database Isolation
- **Authentication**: MongoDB enforces SCRAM-SHA-256 authentication.
- **Least Privilege**: `infra/mongo/init.js` creates a dedicated DB and User for each service (e.g. `auth_user`, `library_user`). A compromised microservice cannot access other service schemas.

## 3. Launching the System
1. Copy the `.env.lan.example` and fill in secure passwords:
   ```bash
   cp infra/.env.lan.example infra/.env.lan
   ```
2. Start the LAN environment (run from project root):
   ```bash
   npm run lan:up
   ```
3. Check the status:
   ```bash
   npm run lan:status
   ```
4. Access EduSphere at `http://<SERVER_PRIVATE_IP>` from any device on the network.

## 4. Updates & Rollback
To safely update EduSphere:
```bash
npm run lan:down
git pull
npm run lan:up
```

*Note: Persistent data is safely stored in `lan_*_data` docker volumes and is never destroyed during `lan:down`.*
