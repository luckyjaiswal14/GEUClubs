import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// Mark attendance for an event
router.post('/mark', async (req, res): Promise<any> => {
    try {
        const { userId, eventId, status } = req.body;

        const attendance = await prisma.attendance.upsert({
            where: {
                userId_eventId: {
                    userId,
                    eventId
                }
            },
            update: { status },
            create: {
                userId,
                eventId,
                status: status || 'present'
            }
        });

        res.json(attendance);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get attendance for an event
router.get('/:eventId', async (req, res): Promise<any> => {
    try {
        const { eventId } = req.params;
        const attendances = await prisma.attendance.findMany({
            where: { eventId },
            include: { user: true }
        });
        res.json(attendances);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Add volunteering hours
router.post('/volunteer', async (req, res): Promise<any> => {
    try {
        const { userId, eventId, role, hours } = req.body;

        const volunteering = await prisma.volunteering.create({
            data: {
                userId,
                eventId,
                role,
                hours
            }
        });

        res.status(201).json(volunteering);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
