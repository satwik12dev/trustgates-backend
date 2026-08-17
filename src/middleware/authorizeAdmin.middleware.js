// ==========================================================
// Admin Role Authorization Middleware
// ==========================================================

const authorizeAdmin = (...allowedRoles) => {

    // ------------------------------------------------------
    // Normalize allowed roles once when middleware is created
    // ------------------------------------------------------

    const normalizedAllowedRoles =
        allowedRoles
            .map(role =>
                String(role)
                    .trim()
                    .toUpperCase()
            )
            .filter(Boolean);


    return (req, res, next) => {

        try {

            // ==================================================
            // Authentication Check
            // ==================================================
            //
            // authenticateAdmin must run BEFORE this middleware.
            //
            // authenticateAdmin sets:
            //
            // req.admin = {
            //     admin_id,
            //     full_name,
            //     email,
            //     role,
            //     status
            // }
            //
            // ==================================================

            if (
                !req.admin ||
                !req.admin.admin_id
            ) {

                return res.status(401).json({

                    success: false,

                    code:
                        "ADMIN_UNAUTHORIZED",

                    message:
                        "Admin authentication is required."

                });

            }


            // ==================================================
            // Admin ID Validation
            // ==================================================

            const adminId =
                Number(
                    req.admin.admin_id
                );


            if (
                !Number.isInteger(adminId) ||
                adminId <= 0
            ) {

                return res.status(401).json({

                    success: false,

                    code:
                        "INVALID_ADMIN_CONTEXT",

                    message:
                        "Invalid admin authentication context."

                });

            }


            // ==================================================
            // Account Status Check
            // ==================================================
            //
            // authenticateAdmin already checks this, but keeping
            // this check here provides defense in depth.
            //
            // ==================================================

            if (
                req.admin.status !== "ACTIVE"
            ) {

                return res.status(403).json({

                    success: false,

                    code:
                        "ADMIN_INACTIVE",

                    message:
                        "Admin account is inactive."

                });

            }


            // ==================================================
            // Role Check
            // ==================================================

            if (
                !req.admin.role
            ) {

                return res.status(403).json({

                    success: false,

                    code:
                        "ADMIN_ROLE_MISSING",

                    message:
                        "Admin role is missing."

                });

            }


            // ==================================================
            // Normalize Current Role
            // ==================================================

            const adminRole =
                String(
                    req.admin.role
                )
                    .trim()
                    .toUpperCase();


            // ==================================================
            // Validate Allowed Roles Configuration
            // ==================================================

            if (
                normalizedAllowedRoles.length === 0
            ) {

                return res.status(403).json({

                    success: false,

                    code:
                        "ADMIN_PERMISSION_NOT_CONFIGURED",

                    message:
                        "No admin role is configured for this resource."

                });

            }


            // ==================================================
            // Authorization
            // ==================================================

            if (
                !normalizedAllowedRoles.includes(
                    adminRole
                )
            ) {

                return res.status(403).json({

                    success: false,

                    code:
                        "ADMIN_INSUFFICIENT_PERMISSION",

                    message:
                        "You do not have permission to perform this action."

                });

            }


            // ==================================================
            // Store Authorized Role
            // ==================================================
            //
            // Optional but useful for audit/security middleware.
            //
            // ==================================================

            req.adminRole =
                adminRole;


            // ==================================================
            // Authorized
            // ==================================================

            next();

        } catch (error) {

            next(error);

        }

    };

};


module.exports =
    authorizeAdmin;