const transporter = require("../../config/brevo");

const sendKycStatusEmail = async ({
    email,
    merchantName,
    status,
    notes
}) => {

    const isApproved = status === "APPROVED";

    const subject = isApproved
        ? "🎉 Your KYC Has Been Successfully Verified"
        : "Action Required: KYC Verification Rejected";

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body{
    margin:0;
    padding:0;
    background:#f4f6f9;
    font-family:Arial,Helvetica,sans-serif;
}
.container{
    max-width:650px;
    margin:auto;
    background:#ffffff;
}
.header{
    background:${isApproved ? "#16a34a" : "#dc2626"};
    color:#fff;
    padding:30px;
    text-align:center;
}
.content{
    padding:35px;
    color:#333;
    line-height:1.7;
}
.status{
    font-size:22px;
    font-weight:bold;
    color:${isApproved ? "#16a34a" : "#dc2626"};
}
.footer{
    padding:25px;
    background:#f8fafc;
    text-align:center;
    color:#666;
    font-size:13px;
}
.box{
    background:#f8fafc;
    border-left:5px solid ${isApproved ? "#16a34a" : "#dc2626"};
    padding:18px;
    margin-top:20px;
}
</style>
</head>

<body>

<div class="container">

<div class="header">
<h1>Payment Gateway</h1>
</div>

<div class="content">

<p>Dear <strong>${merchantName}</strong>,</p>

${
    isApproved
        ? `
<p>We are pleased to inform you that your Know Your Customer (KYC) verification has been successfully completed.</p>

<p class="status">✅ KYC Approved</p>

<p>Your merchant account is now verified and eligible to access all platform features, including payment processing and settlements.</p>
`
        : `
<p>After reviewing your submitted KYC documents, we were unable to approve your verification.</p>

<p class="status">❌ KYC Rejected</p>

<p>Please review the information below and resubmit the required documents.</p>
`
}

<div class="box">

<b>Verification Status:</b> ${status}

${
    notes
        ? `<br><br><b>Admin Remarks:</b><br>${notes}`
        : ""
}

</div>

${
    isApproved
        ? `
<p>Thank you for completing the verification process.</p>

<p>We appreciate your trust in our platform and look forward to supporting your business.</p>
`
        : `
<p>If you have any questions or need assistance, please contact our support team.</p>
`
}

<p>Regards,<br>
<strong>Compliance Team</strong><br>
Payment Gateway</p>

</div>

<div class="footer">
This is an automated email. Please do not reply.
</div>

</div>
</body>
</html>
`;
    await transporter.sendMail({
        from: process.env.BREVO_SENDER_EMAIL,
        to: email,
        subject,
        html
    });
};

module.exports = sendKycStatusEmail;