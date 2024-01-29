import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@lib/PrismaInstance';

const verifyHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ error: 'Missing verification token' });
        }

        // Trouver l'utilisateur avec le token de vérification
        const user = await prisma.membre.findUnique({
            where: { verification_token: token as string },
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid verification token' });
        }

        try {
            // Vérifier l'email
            const updatedUser = await prisma.membre.update({
                where: { id_membre: user.id_membre },
                data: { isEmailVerified: true, verification_token: null },
            });

            res.json(updatedUser);
        } catch (error) {
            console.error('Error verifying email:', error);
            res.status(500).json({ error: 'Failed to verify email' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};

export default verifyHandler;