const forgotPasswordValidation =
    require(
        "../../../validations/admin/forgotPassword.validation"
    );

const {
    forgotPasswordService
} = require(
    "../../../services/admin/password/forgotPassword.service"
);


const forgotPasswordController = async (
    req,
    res,
    next
) => {

    try {

        const {
            error,
            value
        } = forgotPasswordValidation.validate(
            req.body,
            {
                abortEarly: true,
                stripUnknown: true
            }
        );


        if (error) {

            return res.status(400).json({
                success: false,
                code:
                    "INVALID_FORGOT_PASSWORD_REQUEST",
                message:
                    error.details[0].message
            });
        }


        const result =
            await forgotPasswordService(
                value.email
            );


        return res.status(200).json({
            success: true,
            message:
                result.message
        });


    } catch (error) {

        next(error);
    }
};


module.exports =
    forgotPasswordController;