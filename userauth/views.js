import { OAuth2Client } from 'google-auth-library';
import User from './models.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class GoogleAuthView {
    async GET(req, res) {
        // Check if authentication cookie is set
        if (!req.cookies){
            return res.Response({success: false, message: "Invalid Request"}, 403)
        }
        const authUser = req.cookies.auth;
        if (authUser) {
            let userData;
            try {
                userData = typeof authUser === 'string' ? JSON.parse(authUser) : authUser;
            } catch (err) {
                return res.Response({ success: false, error: 'Invalid auth cookie' }, 401);
            }
            return res.Response({ success: true, user: userData });
        }
        return res.Response({ success: false, error: "Not authenticated" }, 401);
    }
    async POST(req, res) {
        console.log(req.body, "BODY")
        const { token } = req.body || {};
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            console.log("PAYLOAD", payload)
            const { email, name, sub: googleId } = payload;
            
            let user = await User.findOne({ email });
            if (!user) {
                user = new User({ email, name, googleId });
                await user.save();
            } else {
                let needsUpdate = false;
                if (user.name !== name) {
                    user.name = name;
                    needsUpdate = true;
                }
                if (user.googleId !== googleId) {
                    user.googleId = googleId;
                    needsUpdate = true;
                }
                if (needsUpdate) {
                    await user.save();
                }
            }

            res.cookie(
                'auth', 
                JSON.stringify({ email: user.email, name: user.name, googleId: user.googleId }),
                { httpOnly: true, secure: false, maxAge: 3600000, sameSite: 'none' } // cookie lasts 1 hour
            );
            
            return res.status(200).json({ success: true, user: { email: user.email, name: user.name, googleId } });
        } catch (error) {
            console.error('Google token verification failed:', error);
            return res.status(401).json({ error: 'Invalid token' });
        }
    }
}

export class SignOutView {
    async GET(req, res) {
        res.clearCookie('auth');
        return res.status(200).json({ success: true, message: "Signed out successfully" });
    }
}