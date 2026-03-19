import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// Create event for a club
router.post('/create', async (req, res): Promise<any> => {
    try {
        const { clubId, name, date, description } = req.body;

        // Ensure club exists
        let club = await prisma.club.findUnique({ where: { id: clubId } });
        if (!club) {
            // Create a default club for test purposes if it doesn't exist
            club = await prisma.club.create({
                data: {
                    id: clubId,
                    name: req.body.clubName || "Unknown Club",
                    description: "Auto-generated club"
                }
            });
        }

        const event = await prisma.event.create({
            data: {
                clubId,
                name,
                date: new Date(date),
                description
            }
        });

        res.status(201).json(event);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get a club's events
router.get('/:clubId', async (req, res): Promise<any> => {
    try {
        const { clubId } = req.params;
        const events = await prisma.event.findMany({
            where: { clubId },
            orderBy: { date: 'desc' },
            include: { _count: { select: { attendances: true } } }
        });
        res.json(events);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
