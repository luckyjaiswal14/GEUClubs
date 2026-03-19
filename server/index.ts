import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

import membershipRoutes from './routes/membership';
import eventRoutes from './routes/events';
import attendanceRoutes from './routes/attendance';
import performanceRoutes from './routes/performance';

const app = express();
const port = process.env.PORT || 3001;

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/membership', membershipRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/performance', performanceRoutes);

// Base Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Club Management API' });
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
