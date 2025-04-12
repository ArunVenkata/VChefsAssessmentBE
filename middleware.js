import User from './userauth/models.js';

export async function UserAuthMiddleware(req, res, next) {
    req.auth_user = null;

    if (req.cookies && req.cookies.auth) {
        let authData;
        try {
            authData = typeof req.cookies.auth === 'string' ? JSON.parse(req.cookies.auth) : req.cookies.auth;
        } catch (error) {
            console.error("Error parsing auth cookie:", error);
            return next();
        }
        
        if (authData && authData.email) {
            try {
                const user = await User.findOne({ email: authData.email }).sort({ updatedAt: -1 }).exec();
                if (user) {
                    req.auth_user = user;
                }
            } catch (err) {
                console.error("Error retrieving user from database:", err);
            }
        }
    }
    
    return next();
}

