const Joi = require('joi');

const attendeeSchema = Joi.object({
    firstName: Joi.string().required().trim(),
    lastName: Joi.string().required().trim(),
    email: Joi.string().email().allow('').trim(),
    notes: Joi.string().allow('').trim(),
    checkedIn: Joi.boolean().default(false),
    photographyTimeSlot: Joi.string().allow('').trim(),
    photographyStatus: Joi.string().valid('pending', 'completed', 'cancelled').default('pending'),
    photographyEmail: Joi.string().email().allow('').trim(),
    children: Joi.array().items(
        Joi.object({
            name: Joi.string().required().trim(),
            age: Joi.number().integer().min(0).max(18).allow(null),
            gender: Joi.string().valid('M', 'F', '').allow(null)
        })
    ).default([])
});

const validateAttendee = async (req, res, next) => {
    try {
        const validatedData = await attendeeSchema.validateAsync(req.body, { abortEarly: false });
        req.validatedData = validatedData;
        next();
    } catch (error) {
        return res.status(400).json({
            error: 'Validation error',
            details: error.details.map(detail => ({
                message: detail.message,
                path: detail.path
            }))
        });
    }
};

module.exports = {
    validateAttendee
};