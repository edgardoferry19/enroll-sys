import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import adminRoutes from './routes/admin.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import subjectRoutes from './routes/subject.routes';
import transactionRoutes from './routes/transaction.routes';
import maintenanceRoutes from './routes/maintenance.routes';
import facultyRoutes from './routes/faculty.routes';
import gradesRoutes from './routes/grades.routes';
import registrarRoutes from './routes/registrar.routes';
import deanRoutes from './routes/dean.routes';
import superadminRoutes from './routes/superadmin.routes';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/grades', gradesRoutes);
app.use('/api/registrar', registrarRoutes);
app.use('/api/dean', deanRoutes);
app.use('/api/superadmin', superadminRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Enrollment System API is running' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Enrollment System API - Environment: ${process.env.NODE_ENV}`);
});

export default app;
