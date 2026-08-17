const {
    findRefreshToken,
    revokeRefreshToken
} = require("../../../services/auth/refreshToken.service");


const logout = async (req, res) => {

    try {

        const { refreshToken } = req.body;

        // --------------------------------------------
        // 1. Refresh token required
        // --------------------------------------------

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required."
            });
        }


        // --------------------------------------------
        // 2. Find current refresh token
        // --------------------------------------------

        const storedToken = await findRefreshToken(
            refreshToken
        );


        // --------------------------------------------
        // 3. Token not found
        // --------------------------------------------

        if (!storedToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token."
            });
        }


        // --------------------------------------------
        // 4. Already revoked
        // --------------------------------------------

        if (storedToken.revoked) {
            return res.status(200).json({
                success: true,
                message: "Already logged out."
            });
        }


        // --------------------------------------------
        // 5. Revoke ONLY current session
        // --------------------------------------------

        await revokeRefreshToken(
            storedToken.token_id
        );


        // --------------------------------------------
        // 6. Response
        // --------------------------------------------

        return res.status(200).json({
            success: true,
            message: "Logout successful."
        });

    } catch (error) {

        console.error(
            "Logout Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });
    }
};


module.exports = logout;