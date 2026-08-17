const { randomUUID } = require("crypto");

const generateCancelCode= () => {

    return `CAL_${randomUUID()}`;

};
module.exports = generateCancelCode;