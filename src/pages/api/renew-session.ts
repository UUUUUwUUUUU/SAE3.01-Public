import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSession } from 'next-iron-session';
import { Session } from 'next-iron-session';

interface NextIronRequest extends NextApiRequest {
    session: Session;
}

const renewSession = async (req: NextIronRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const user = req.session.get('user');
        if (user) {
            user.expires = new Date(Date.now() + 1209600000); // 14j (en millisecondes)
            req.session.set('user', user);
            await req.session.save();
            // console.log('User session renewed:', user);
            // console.log('New session expiration:', user.expires); 
        } else {
            // console.log('No user session to renew');
        }
        res.status(200).end();
    } else {
        console.log('Invalid request method:', req.method);
        res.status(405).end();
    }
};

export default withIronSession(renewSession, {
    password: process.env.SECRET_COOKIE_PASSWORD || '',
    cookieName: 'NaturothequeSession',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1209600, // 14j (en secondes)
    },
});