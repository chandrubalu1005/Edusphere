require('../../../fix-dns.js');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectRabbitMQ } = require('./config/rabbitmq');
const courseRoutes = require('./routes/courseRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3003;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere_courses';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

// Register routes
app.use('/', courseRoutes);
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'course-service' }));

// Swagger API Documentation
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Course Service API',
    version: '1.0.0',
    description: 'Enterprise EduSphere Course Catalog & Syllabus Management Service API'
  },
  paths: {
    '/': {
      get: {
        summary: 'List all courses',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Courses returned successfully' }
        }
      },
      post: {
        summary: 'Create a new course (Faculty / Admin only)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  department: { type: 'string' }
                },
                required: ['code', 'title', 'department']
              }
            }
          }
        },
        responses: {
          201: { description: 'Course created' },
          403: { description: 'Access forbidden' }
        }
      }
    },
    '/{id}': {
      get: {
        summary: 'Get single course details',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Course returned' },
          404: { description: 'Course not found' }
        }
      }
    },
    '/{id}/content': {
      post: {
        summary: 'Add content item to course (Owner only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  type: { type: 'string', enum: ['document', 'video', 'link'] },
                  url: { type: 'string' }
                },
                required: ['title', 'url']
              }
            }
          }
        },
        responses: {
          200: { description: 'Content item added' },
          403: { description: 'Access forbidden' }
        }
      }
    },
    '/{id}/approve': {
      post: {
        summary: 'Approve course publication (Management only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Approved successfully' }
        }
      }
    },
    '/{id}/reject': {
      post: {
        summary: 'Reject course publication (Management only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reason: { type: 'string' }
                },
                required: ['reason']
              }
            }
          }
        },
        responses: {
          200: { description: 'Rejected successfully' }
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
      <title>Course Service API Docs</title>
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
  app.listen(PORT, () => console.log(`Course Service listening on port ${PORT}`));
}

startServer();
