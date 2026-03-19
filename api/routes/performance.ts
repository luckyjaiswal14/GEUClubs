import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

router.get('/:userId', async (req, res): Promise<any> => {
    try {
        const { userId } = req.params;
        let performance = await prisma.performance.findUnique({
            where: { userId }
        });

        if (!performance) {
            // Create empty performance if it doesn't exist
            performance = await prisma.performance.create({
                data: { userId }
            });
        }

        res.json(performance);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/calculate', async (req, res): Promise<any> => {
    try {
        const { userId } = req.body;

        // Get total events user could have attended (events for all clubs the user is in)
        const memberships = await prisma.membership.findMany({ where: { userId } });
        const clubIds = memberships.map(m => m.clubId);

        const totalEvents = await prisma.event.count({
            where: { clubId: { in: clubIds } }
        });

        // Get user's attendances
        const attendances = await prisma.attendance.findMany({
            where: { userId, status: 'present' }
        });
        const eventsParticipated = attendances.length;

        const attendanceRate = totalEvents > 0 ? eventsParticipated / totalEvents : 0;

        // Get volunteering hours
        const volunteerings = await prisma.volunteering.findMany({
            where: { userId }
        });
        const volunteerHours = volunteerings.reduce((sum, v) => sum + v.hours, 0);

        // Score Formula: (attendanceRate * 40) + (eventsParticipated * 20) + (volunteerHours * 40)
        // Capped at 100 for normalization, or left unbounded based on preference. Unbounded for now.
        const score = (attendanceRate * 40) + (eventsParticipated * 20) + (volunteerHours * 40);

        const performance = await prisma.performance.upsert({
            where: { userId },
            update: {
                score,
                attendanceRate,
                eventsParticipated,
                volunteerHours
            },
            create: {
                userId,
                score,
                attendanceRate,
                eventsParticipated,
                volunteerHours
            }
        });

        // Check Eligibility for Certification
        // Rule: attendance_rate > 70% (0.7), events_participated >= 5, volunteer_hours >= 10
        if (attendanceRate >= 0.7 && eventsParticipated >= 5 && volunteerHours >= 10) {
            for (const clubId of clubIds) {
                await prisma.certification.upsert({
                    where: { userId_clubId: { userId, clubId } },
                    update: { eligible: true },
                    create: { userId, clubId, eligible: true }
                });
            }
        }

        res.json({ performance, message: 'Performance calculated and certifications evaluated successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
