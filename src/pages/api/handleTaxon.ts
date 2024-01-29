import prisma from '@lib/PrismaInstance';
import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSession } from 'next-iron-session';
import TaxonOperation from '@/types/TaxonOperation';

const saveTaxon = async (req: NextApiRequest & { session: any }, res: NextApiResponse) => {
    const user = req.session.get('user');

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'POST' && req.body.operation === TaxonOperation.ADD) {
        const { id_membre, idtaxon } = req.body;

        try {
            const existingTaxon = await prisma.naturotheque.findUnique({ where: { id_membre_idtaxon: { id_membre: id_membre, idtaxon: Number(idtaxon) } } });

            if (existingTaxon) {
                res.status(200).json({ message: 'Taxon already exists in naturotheque.' });
            } else {
                const result = await prisma.naturotheque.create({
                    data: {
                        id_membre: id_membre,
                        idtaxon: Number(idtaxon)
                    }
                });

                res.status(200).json({ message: 'Taxon successfully saved.', result });
            }
        } catch (error) {
            res.status(500).json({ message: 'An error occurred while saving the taxon.', error });
        }
    } else if (req.method === 'POST' && req.body.operation === TaxonOperation.DELETE) {
        const { id_membre, idtaxon } = req.body;

        try {
            const existingTaxon = await prisma.naturotheque.findUnique({ where: { id_membre_idtaxon: { id_membre: id_membre, idtaxon: Number(idtaxon) } } });

            if (existingTaxon) {
                await prisma.naturotheque.delete({ where: { id_membre_idtaxon: { id_membre: id_membre, idtaxon: Number(idtaxon) } } });
                res.status(200).json({ message: 'Taxon successfully deleted.' });
            } else {
                res.status(404).json({ message: 'Taxon not found in naturotheque.' });
            }
        } catch (error) {
            res.status(500).json({ message: 'An error occurred while deleting the taxon.', error });
        }
    } else if (req.method === 'POST' && req.body.operation === TaxonOperation.EXISTS) {
        const { id_membre, idtaxon } = req.body;

        try {
            const existingTaxon = await prisma.naturotheque.findUnique({ where: { id_membre_idtaxon: { id_membre: id_membre, idtaxon: Number(idtaxon) } } });

            if (existingTaxon) {
                res.status(200).json({ message: 'Taxon exists in naturotheque.' });
            } else {
                res.status(200).json({ message: 'Taxon not found in naturotheque.' });
            }
        } catch (error) {
            res.status(500).json({ message: 'An error occurred while checking the taxon.', error });
        }
    } else {
        res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
};

export default withIronSession(saveTaxon, {
    password: process.env.SECRET_COOKIE_PASSWORD || '',
    cookieName: 'NaturothequeSession',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
    },
});