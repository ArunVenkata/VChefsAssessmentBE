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
    console.log("RECEIVED TOKEN", Boolean(req.token));
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;
        console.log("EMAIL FOUND", email);
        let authUser = await User.findOne({ email }).sort({ updatedAt: -1 }).exec();
        if (authUser) {
            req.auth_user = authUser;
            console.log("AUTH USER SET", req.auth_user)
            return next();
        }
    } catch (e) {
        console.log("err",e)
    }
    // if (req.cookies && req.cookies.auth) {
    //     let authData;
    //     try {
    //         authData = typeof req.cookies.auth === 'string' ? JSON.parse(req.cookies.auth) : req.cookies.auth;
    //     } catch (error) {
    //         console.error("Error parsing auth cookie:", error);
    //         return next();
    //     }

    //     if (authData && authData.email) {
    //         try {
    //             const user = await User.findOne({ email: authData.email }).sort({ updatedAt: -1 }).exec();
    //             if (user) {
    //                 req.auth_user = user;
    //             }
    //         } catch (err) {
    //             console.error("Error retrieving user from database:", err);
    //         }
    //     }
    // }

    return next();
}

