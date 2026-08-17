const redis = require("../config/redis");

// ==========================================================
// Idempotency Middleware
// ==========================================================

const idempotencyMiddleware = async (req, res, next) => {

    try {

        const merchantId = req.merchant?.merchant_id;

        const idempotencyKey = req.header("Idempotency-Key");

        if (!idempotencyKey) {

            return res.status(400).json({

                success: false,

                message: "Idempotency-Key header is required."

            });

        }

        const lockKey =

            `idempotency:${merchantId}:${idempotencyKey}:lock`;

        const responseKey =

            `idempotency:${merchantId}:${idempotencyKey}:response`;

        // ======================================================
        // Already Processed?
        // ======================================================

        const cachedResponse = await redis.get(responseKey);

        if (cachedResponse) {

            return res.status(200).json(

                JSON.parse(cachedResponse)

            );

        }

        // ======================================================
        // Acquire Lock
        // ======================================================

        const acquired = await redis.set(

            lockKey,

            "PROCESSING",

            {

                NX: true,

                EX: 600

            }

        );

        if (!acquired) {

            return res.status(409).json({

                success: false,

                message: "A request with this Idempotency-Key is already processing."

            });

        }

        // ======================================================
        // Monkey Patch res.json()
        // ======================================================

        const originalJson = res.json.bind(res);

        res.json = async (body) => {

            try {

                if (

                    res.statusCode >= 200 &&

                    res.statusCode < 300

                ) {

                    await redis.set(

                        responseKey,

                        JSON.stringify(body),

                        {

                            EX: 86400 // 24 Hours

                        }

                    );

                }

            } catch (err) {

                console.error(

                    "Idempotency Cache Error:",

                    err

                );

            } finally {

                await redis.del(lockKey);

            }

            return originalJson(body);

        };

        next();

    } catch (error) {

        next(error);

    }

};

module.exports = idempotencyMiddleware;