import { withIronSession } from 'next-iron-session';
import { NextApiRequest, NextApiResponse } from 'next';

interface CustomNextApiRequest extends NextApiRequest {
    session: {
        get: (key: string) => any;
    };
}

const handler = async (req: CustomNextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
        const user = req.session.get('user');
        if (user) {
            res.status(200).json({ loggedIn: true, user });
        } else {
            res.status(200).json({ loggedIn: false });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
};

export default withIronSession(handler, {
    password: process.env.SECRET_COOKIE_PASSWORD || '',
    cookieName: 'NaturothequeSession',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
});