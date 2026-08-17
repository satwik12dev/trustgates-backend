require("dotenv").config();


// ==========================================================
// Environment Validation
// ==========================================================

const REQUIRED_ENV = [

    // Database
    "DB_HOST",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",

    // Authentication
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",

    // Redis
    "REDIS_HOST",
    "REDIS_PORT",

    // Frontend / CORS
    "FRONTEND_URL"

];


// ==========================================================
// Validate Required Variables
// ==========================================================

const missingVariables = REQUIRED_ENV.filter(
    (key) =>
        !process.env[key] ||
        !String(process.env[key]).trim()
);


// ==========================================================
// Fail Fast
// ==========================================================

if (
    missingVariables.length > 0
) {

    console.error(
        "\n❌ Missing required environment variables:\n"
    );

    missingVariables.forEach(
        (key) => {
            console.error(
                `   - ${key}`
            );
        }
    );

    console.error(
        "\n❌ Server startup aborted.\n"
    );

    process.exit(1);

}


// ==========================================================
// Production Validation
// ==========================================================

if (
    process.env.NODE_ENV ===
    "production"
) {

    // ------------------------------------------------------
    // JWT Secret Strength
    // ------------------------------------------------------

    if (
        process.env.JWT_SECRET.length < 32
    ) {

        console.error(
            "❌ JWT_SECRET must be at least 32 characters in production."
        );

        process.exit(1);

    }


    if (
        process.env.JWT_REFRESH_SECRET.length < 32
    ) {

        console.error(
            "❌ JWT_REFRESH_SECRET must be at least 32 characters in production."
        );

        process.exit(1);

    }


    // ------------------------------------------------------
    // JWT Secrets Must Be Different
    // ------------------------------------------------------

    if (
        process.env.JWT_SECRET ===
        process.env.JWT_REFRESH_SECRET
    ) {

        console.error(
            "❌ JWT_SECRET and JWT_REFRESH_SECRET must be different."
        );

        process.exit(1);

    }


    // ------------------------------------------------------
    // FRONTEND_URL
    // ------------------------------------------------------

    try {

        const frontendUrl =
            new URL(
                process.env.FRONTEND_URL
            );


        if (
            ![
                "http:",
                "https:"
            ].includes(
                frontendUrl.protocol
            )
        ) {

            throw new Error();

        }

    } catch {

        console.error(
            "❌ FRONTEND_URL must be a valid HTTP/HTTPS URL."
        );

        process.exit(1);

    }

}


// ==========================================================
// Export
// ==========================================================

module.exports = {
    env: process.env
};