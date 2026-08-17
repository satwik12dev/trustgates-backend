const crypto = require("crypto");


const generateWalletReference = (

    prefix = "WALLET"

) => {


    const uniqueId = crypto

        .randomUUID()

        .replace(/-/g, "")

        .substring(0,16);


    return `${prefix}_${uniqueId}`;

};


module.exports = generateWalletReference;