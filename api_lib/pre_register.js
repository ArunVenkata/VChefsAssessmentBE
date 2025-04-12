export const APIWrapper = (BaseClass) => {
    return class extends BaseClass {
        methods = ["GET", "PUT", "PATCH", "DELETE", "POST"]
        queryIdName = ""

        constructor() {
            super();
        }

        GET(...args) {
            const req = args[0];
            const res = args[1];
            const checks = this.shouldAllow(args[0]);
            if (!checks.success) {
                return res.Response({ success: checks.success, message: checks.message }, checks.status || 200)
            }
            return super.GET(...args);
        }

        POST(...args) {
            const req = args[0];
            const res = args[1];
            const checks = this.shouldAllow(args[0]);
            if (!checks.success) {
                return res.Response({ success: checks.success, message: checks.message }, checks.status || 200)
            }
            return super.POST(...args);
        }

        PATCH(...args) {
            const req = args[0];
            const res = args[1];
            const checks = this.shouldAllow(args[0]);
            if (!checks.success) {
                return res.Response({ success: checks.success, message: checks.message }, checks.status || 200)
            }
            return super.PATCH(...args);
        }

        PUT(...args) {
            const req = args[0];
            const res = args[1];
            const checks = this.shouldAllow(args[0]);
            if (!checks.success) {
                return res.Response({ success: checks.success, message: checks.message }, checks.status || 200)
            }
            return super.PUT(...args);
        }
        DELETE(...args) {
            const req = args[0];
            const res = args[1];
            const checks = this.shouldAllow(args[0]);
            if (!checks.success) {
                return res.Response({ success: checks.success, message: checks.message }, checks.status || 200)
            }
            return super.DELETE(...args);
        }

        // Additional method for the preliminary check
        shouldAllow(req) {

            const permissions = BaseClass.permissions || [];

            if (permissions.includes("IS_AUTHENTICATED") && !Object.keys(req.auth_user || {}).length) {
                return { success: false, message: "Unauthorized request", status: 403 } 
            }

            return { success: true };
        }
    };
};


