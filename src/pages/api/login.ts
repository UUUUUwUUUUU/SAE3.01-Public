import prisma from '@lib/PrismaInstance';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSession } from 'next-iron-session';
import { Session } from 'next-iron-session';

interface NextIronRequest extends NextApiRequest {
    session: Session;
}

/**
 * @see https://mrcoles.com/blog/cookies-max-age-vs-expires/
 * @param req 
 * @param res 
 * @returns 
 */
const login = async (req: NextIronRequest, res: NextApiResponse) => {
    try {
        if (req.method === 'POST') {
            const user = await prisma.membre.findUnique({ where: { email: req.body.email } });
            if (!user) {
                return res.status(400).json({ message: 'Incorrect email or password.' });
            }
            if (!user.isEmailVerified) {
                return res.status(400).json({ message: 'Email not verified.' });
            }
            const validPassword = await bcrypt.compare(req.body.userpassword, user.userpassword);
            if (!validPassword) {
                return res.status(400).json({ message: 'Incorrect email or password.' });
            }

            req.session.set('user', { id: user.id_membre, email: user.email, expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) });
            await req.session.save();
            res.json(user);
        } else {
            res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server is not reachable.' });
    }
};

export default withIronSession(login, {
    password: process.env.SECRET_COOKIE_PASSWORD || '',
    cookieName: 'NaturothequeSession',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 14, // 14j
    },
});