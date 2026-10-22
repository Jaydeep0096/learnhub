import express from 'express';
import cors from 'cors';
import courseRoutes from './routes/courseRoutes.js';
import { notFound, errorHandler } from './middleware/errors.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';   

export function createApp() {
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
  app.use('/api/courses', courseRoutes);

   app.use('/api/courses', courseRoutes);
  app.use('/api/enrollments', enrollmentRoutes);  

  app.use(notFound);
  app.use(errorHandler);                

  return app;
}
