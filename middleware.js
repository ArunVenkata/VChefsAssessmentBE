import User from './userauth/models.js';
import { OAuth2Client } from 'google-auth-library';

export async function UserAuthMiddleware(req, res, next) {

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    req.auth_user = null;
    req.token = null
    const authHeader = req.headers.authorization;


    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.Response({ success: false, error: "No authorization token provided" }, 401);
    }
    const token = authHeader.split(' ')[1];
    req.token = token
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;
        let authUser = await User.findOne({ email }).sort({ updatedAt: -1 }).exec();
        if (authUser) {
            req.auth_user = authUser;
            return next();
        }
    } catch (e) {
        console.log("err",e)
    }

    return next();
}

