import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// Add user to a club
router.post('/add', async (req, res): Promise<any> => {
    try {
        const { userId, clubId, role } = req.body;

        // Make sure user exists (Firebase sync)
        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            // Assuming name and email can be passed or we fetch from firebase, fallback for now
            user = await prisma.user.create({
                data: {
                    id: userId,
                    email: req.body.email || `${userId}@example.com`,
                    name: req.body.name || 'Unknown User',
                }
            });
        }

        const membership = await prisma.membership.create({
            data: {
                userId,
                clubId,
                role: role || 'member'
            }
        });

        res.status(201).json(membership);
    } catch (error: any) {
        if (error.code === 'P2002') return res.status(400).json({ error: 'Membership already exists' });
        res.status(500).json({ error: error.message });
    }
});

// Get all members of a club
router.get('/:clubId', async (req, res): Promise<any> => {
    try {
        const { clubId } = req.params;
        const members = await prisma.membership.findMany({
            where: { clubId },
            include: { user: true }
        });
        res.json(members);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update a member's role
router.patch('/role', async (req, res): Promise<any> => {
    try {
        const { userId, clubId, role } = req.body;
        const membership = await prisma.membership.update({
            where: {
                userId_clubId: {
                    userId,
                    clubId
                }
            },
            data: { role }
        });
        res.json(membership);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
