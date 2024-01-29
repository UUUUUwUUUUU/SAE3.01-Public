import prisma from '@lib/PrismaInstance';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import SibApiV3Sdk from 'sib-api-v3-sdk';

// TODO: Idée, AutoSuppression des comptes non vérifiés au bout de 24h?

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const registerHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method === 'POST') {
            const existingUser = await prisma.membre.findUnique({
                where: {
                    email: req.body.email,
                },
            });

            if (existingUser && !existingUser.isEmailVerified) {
                // Compte déjà existant mais email non vérifié
                return res.status(400).json({ message: 'Email not verified' });
            }

            const hashedPassword = await bcrypt.hash(req.body.userpassword, 10);
            const verificationToken = uuidv4();
            const user = await prisma.membre.create({
                data: {
                    email: req.body.email,
                    userpassword: hashedPassword,
                    verification_token: verificationToken,
                },
            });
            console.log('User registered:', user);

            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
            sendSmtpEmail.to = [{ email: req.body.email }];

            if (req.body.language === 'fr') {
                sendSmtpEmail.subject = 'Vérification de l\'email - MaNaturothèque';
                sendSmtpEmail.sender = { email: 'noreply@manaturotheque.com', name: 'MaNaturothèque' };
                sendSmtpEmail.htmlContent = `<p>Veuillez vérifier votre email en cliquant <a href="${process.env.BASE_URL}/verify?token=${verificationToken}">ici</a>.</p>`;
            } else if (req.body.language === 'en') {
                sendSmtpEmail.subject = 'Email Verification - MaNaturothèque';
                sendSmtpEmail.sender = { email: 'noreply@manaturotheque.com', name: 'MaNaturothèque' };
                sendSmtpEmail.htmlContent = `<p>Please verify your email by clicking <a href="${process.env.BASE_URL}/verify?token=${verificationToken}">here</a>.</p>`;
            } else {
                return res.status(400).json({ message: 'Invalid language.' });
            }

            apiInstance.sendTransacEmail(sendSmtpEmail).then(
                () => {
                    res.json({ message: 'Verification email sent.' });
                },
                (error: any) => {
                    console.error('Error sending verification email:', error);
                    res.status(500).json({ message: 'Failed to send verification email.' });
                }
            );
        } else {
            res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export default registerHandler;