import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSession } from 'next-iron-session';
import prisma from '@lib/PrismaInstance';

// TODO : Gérer Prisma "Can't reach database server" <- Fait, confirmer que ça marche

const handler = async (req: NextApiRequest & { session: any }, res: NextApiResponse) => {
    const user = req.session.get('user');

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id_membre } = req.query;

    if (req.method === 'GET') {
        try {
            const taxons = await prisma.naturotheque.findMany({
                where: {
                    id_membre: Number(id_membre),
                },
            });

            if (taxons.length === 0) {
                return res.status(204).json({ error: 'No taxons found.' });
            }

            res.json(taxons);
        } catch (error) {
            console.log('Error fetching taxons:', error);
            res.status(500).json({ error: 'An error occurred while fetching the taxons.' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed.' });
    }
};

export default withIronSession(handler, {
    password: process.env.SECRET_COOKIE_PASSWORD || '',
    cookieName: 'NaturothequeSession',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
    },
});