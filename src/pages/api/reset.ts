import prisma from '@lib/PrismaInstance';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';

const resetHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ error: 'Missing token or password' });
        }

        // Trouve l'utilisateur avec le token 
        const user = await prisma.membre.findUnique({
            where: { reset_token: token as string },
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid reset token' });
        }

        // Vérifie que le token n'a pas expiré
        if (user.token_expire && user.token_expire < new Date()) {
            return res.status(400).json({ error: 'Reset token has expired' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            // Mets à jour le mot de passe de l'utilisateur + supprime le token 
            const updatedUser = await prisma.membre.update({
                where: { id_membre: user.id_membre },
                data: {
                    userpassword: hashedPassword,
                    reset_token: null,
                    token_expire: null,
                },
            });

            res.json(updatedUser);
        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({ error: 'Failed to reset password' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};

export default resetHandler;