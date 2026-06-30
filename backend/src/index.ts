import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

import { getMockStatus } from './config/db';
import authRouter from './routes/auth';
import employeesRouter from './routes/employees';
import skillsRouter from './routes/skills';
import coursesRouter from './routes/courses';
import tasksRouter from './routes/tasks';
import attendanceRouter from './routes/attendance';
import reportsRouter from './routes/reports';
import documentsRouter from './routes/documents';
import orgChartRouter from './routes/orgChart';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
  origin: '*', // Allow all for local evaluation
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// System Health & Status Check
app.get('/api/status', (req: Request, res: Response) => {
  return res.json({
    status: 'online',
    timestamp: new Date(),
    mockModeActive: getMockStatus(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Register REST API Routers
app.use('/api/auth', authRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/org-chart', orgChartRouter);

// Swagger Documentation Definition
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Warehouse Employee Training & Skill Management API',
    version: '1.0.0',
    description: 'REST API documentation for Warehouse Staff Training platform, covering authentication, skill matrix, daily task allocations, and attendance tracker.'
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: 'Local Development Server'
    }
  ],
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'Log in user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  loginIdentifier: { type: 'string', example: 'employee1@warehouse.com' },
                  password: { type: 'string', example: 'password123' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'JWT Token and user profile details' }
        }
      }
    },
    '/api/employees': {
      get: {
        summary: 'Get all employees',
        responses: { '200': { description: 'List of users' } }
      },
      post: {
        summary: 'Register new employee',
        responses: { '201': { description: 'Employee profile created' } }
      }
    },
    '/api/skills/matrix': {
      get: {
        summary: 'Retrieve global skill matrix',
        responses: { '200': { description: 'Array of employee skill levels and expiration metrics' } }
      }
    },
    '/api/courses': {
      get: {
        summary: 'List available courses in training library',
        responses: { '200': { description: 'Array of course records' } }
      }
    },
    '/api/tasks': {
      get: {
        summary: 'Get daily warehouse tasks assigned',
        responses: { '200': { description: 'Daily task board list' } }
      }
    },
    '/api/attendance/clock-in': {
      post: {
        summary: 'Clock in attendance for today',
        responses: { '201': { description: 'Working hours record generated' } }
      }
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Fallback for Page Not Found (404)
app.use((req, res) => {
  res.status(404).json({ message: `API path ${req.method} ${req.url} not found.` });
});

// Start listening
app.listen(PORT, () => {
  console.log(`================================================`);
  console.log(` Warehouse Backend API listening on port ${PORT} `);
  console.log(` Swagger Docs available at http://localhost:${PORT}/api-docs `);
  console.log(` Mock DB Status: ${getMockStatus() ? 'ACTIVE (Fallback)' : 'INACTIVE (PostgreSQL Connected)'} `);
  console.log(`================================================`);
});

export default app;
