// ==================================================
// Format Money
// ==================================================

const formatAmount = (amount) => {

    return Number(
        Number(amount).toFixed(2)
    );

};



// ==================================================
// Calculate Credit Balance
// ==================================================

const calculateCreditBalance = (

    currentBalance,

    amount

) => {


    const balanceBefore = formatAmount(
        currentBalance
    );


    const balanceAfter = formatAmount(

        balanceBefore + Number(amount)

    );


    return {

        balanceBefore,

        balanceAfter

    };


};



// ==================================================
// Calculate Debit Balance
// ==================================================

const calculateDebitBalance = (

    currentBalance,

    amount

) => {


    const balanceBefore = formatAmount(
        currentBalance
    );


    const balanceAfter = formatAmount(

        balanceBefore - Number(amount)

    );


    if(balanceAfter < 0){


        throw new Error(
            "Wallet balance cannot be negative."
        );


    }


    return {

        balanceBefore,

        balanceAfter

    };


};



// ==================================================
// Calculate Pending Balance Release
// ==================================================

const calculatePendingRelease = (

    pendingBalance,

    releaseAmount

) => {


    const pendingBefore = formatAmount(
        pendingBalance
    );


    const pendingAfter = formatAmount(

        pendingBefore - Number(releaseAmount)

    );



    if(pendingAfter < 0){


        throw new Error(
            "Pending balance cannot be negative."
        );


    }


    return {

        pendingBefore,

        pendingAfter

    };


};



// ==================================================
// Calculate Wallet Totals
// ==================================================

const calculateWalletTotals = ({

    totalReceived = 0,

    totalRefunded = 0,

    totalSettled = 0,

    receivedAmount = 0,

    refundedAmount = 0,

    settledAmount = 0

}) => {


    return {


        totalReceived:

            formatAmount(

                Number(totalReceived) +

                Number(receivedAmount)

            ),



        totalRefunded:

            formatAmount(

                Number(totalRefunded) +

                Number(refundedAmount)

            ),



        totalSettled:

            formatAmount(

                Number(totalSettled) +

                Number(settledAmount)

            )


    };


};



// ==================================================
// Calculate Available Balance After Debit
// ==================================================

const calculateAvailableBalance = (

    availableBalance,

    debitAmount

) => {


    const balance = formatAmount(

        Number(availableBalance)

        -

        Number(debitAmount)

    );


    if(balance < 0){


        throw new Error(
            "Insufficient available balance."
        );


    }


    return balance;


};



// ==================================================
// Calculate Available Balance After Credit
// ==================================================

const increaseAvailableBalance = (

    availableBalance,

    creditAmount

) => {


    return formatAmount(

        Number(availableBalance)

        +

        Number(creditAmount)

    );


};



// ==================================================
// Calculate Pending Balance Add
// ==================================================

const increasePendingBalance = (

    pendingBalance,

    amount

) => {


    return formatAmount(

        Number(pendingBalance)

        +

        Number(amount)

    );


};



// ==================================================
// Export
// ==================================================

module.exports = {


    calculateCreditBalance,

    calculateDebitBalance,

    calculatePendingRelease,

    calculateWalletTotals,

    calculateAvailableBalance,

    increaseAvailableBalance,

    increasePendingBalance

};