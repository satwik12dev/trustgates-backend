const { randomUUID } = require("crypto");

const generateFailureCode= () => {

    return `FAIL_${randomUUID()}`;

};
module.exports = generateFailureCode;