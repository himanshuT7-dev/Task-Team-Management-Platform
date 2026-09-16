import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDatabase from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';
import {
  routeNotFoundHandler,
  globalErrorHandler
} from './middleware/errorMiddleware.js';

dotenv.config();

connectDatabase();

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Task & Team Management Platform API is running',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.use('/', authRoutes);
app.use('/api', authRoutes);
app.use('/api/auth', authRoutes);

app.use('/tasks', taskRoutes);
app.use('/api/tasks', taskRoutes);

app.use('/users', userRoutes);
app.use('/api/users', userRoutes);

app.use(routeNotFoundHandler);
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
