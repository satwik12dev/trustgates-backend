require("./src/config/env");

const route = require("./src/route");
const ConnectDB = require("./src/db/db");

ConnectDB();

const PORT =
    process.env.PORT || 3000;

route.listen(
    PORT,
    () => {
        console.log(
            `🚀 Server running on port ${PORT}`
        );
    }
);