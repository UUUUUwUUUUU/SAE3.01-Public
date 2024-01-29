import prisma from '@lib/PrismaInstance';
import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import SibApiV3Sdk from 'sib-api-v3-sdk';

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const forgottenHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method === 'POST') {
            const { email, language } = req.body;
            const user = await prisma.membre.findUnique({ where: { email } });
            if (!user) {
                return res.status(400).json({ message: 'Email not found.' });
            }

            const resetToken = uuidv4();
            const tokenExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

            await prisma.membre.update({
                where: { email },
                data: { reset_token: resetToken, token_expire: tokenExpire },
            });

            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
            sendSmtpEmail.to = [{ email }];

            if (language === 'fr') {
                sendSmtpEmail.subject = 'Demande de réinitialisation de mot de passe - MaNaturothèque';
                sendSmtpEmail.sender = { email: 'noreply@manaturotheque.com', name: 'MaNaturothèque' };
                sendSmtpEmail.htmlContent = `<p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez <a href="${process.env.BASE_URL}/reset?token=${resetToken}">ici</a> pour le réinitialiser. Ce lien expirera dans 1 heure.</p>`;
            } else if (language === 'en') {
                sendSmtpEmail.subject = 'Password reset request - MaNaturothèque';
                sendSmtpEmail.sender = { email: 'noreply@manaturotheque.com', name: 'MaNaturothèque' };
                sendSmtpEmail.htmlContent = `<p>You requested to reset your password. Click <a href="${process.env.BASE_URL}/reset?token=${resetToken}">here</a> to reset it. This link will expire in 1 hour.</p>`;
            } else {
                return res.status(400).json({ message: 'Invalid language.' });
            }

            apiInstance.sendTransacEmail(sendSmtpEmail).then(
                () => {
                    res.json({ message: 'Password reset email sent.' });
                },
                (error: any) => {
                    console.error('Error sending password reset email:', error);
                    res.status(500).json({ message: 'Failed to send password reset email.' });
                }
            );
        } else {
            res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server is not reachable.' });
    }
};

export default forgottenHandler;