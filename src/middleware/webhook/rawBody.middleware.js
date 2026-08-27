const rawBodyMiddleware = (
    req,
    res,
    buf
) => {

    if (!buf || !buf.length) {
        return;
    }

    req.rawBody = Buffer.from(buf);
};


module.exports = rawBodyMiddleware;