import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSession, Session } from 'next-iron-session';

const handler = async (req: NextApiRequest & { session?: Session }, res: NextApiResponse) => {
    req.session?.destroy();
    res.status(200).json({ message: 'Logged out' });
};

export default withIronSession(handler, {
    password: process.env.SECRET_COOKIE_PASSWORD || '',
    cookieName: 'NaturothequeSession',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
    },
});