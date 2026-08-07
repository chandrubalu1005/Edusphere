require('../../../fix-dns.js');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectRabbitMQ } = require('./config/rabbitmq');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere_users';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

// Register routes
app.use('/', userRoutes);
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'user-service' }));

// Swagger API Documentation
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'User Service API',
    version: '1.0.0',
    description: 'Enterprise EduSphere User Profiles & Settings Service API'
  },
  paths: {
    '/': {
      get: {
        summary: 'Search user profiles',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Query string to search username/email' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
        ],
        responses: {
          200: { description: 'Profiles list returned' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/{id}': {
      get: {
        summary: 'Get single profile',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Profile data returned' },
          404: { description: 'Profile not found' }
        }
      },
      put: {
        summary: 'Update own profile',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  bio: { type: 'string' },
                  preferences: {
                    type: 'object',
                    properties: {
                      darkMode: { type: 'boolean' },
                      themeName: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Profile updated' },
          403: { description: 'Access forbidden' }
        }
      }
    },
    '/{id}/deactivate': {
      patch: {
        summary: 'Deactivate user profile (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Deactivation successful' },
          403: { description: 'Access forbidden. Admins only' }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
};

app.get('/api-docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>User Service API Docs</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            spec: ${JSON.stringify(swaggerDocument)},
            dom_id: '#swagger-ui',
          });
        };
      </script>
    </body>
    </html>
  `);
});

// Initialization
async function startServer() {
  await connectDB(MONGO_URI);
  await connectRabbitMQ(RABBITMQ_URL);
  app.listen(PORT, () => console.log(`User Service listening on port ${PORT}`));
}

startServer();
