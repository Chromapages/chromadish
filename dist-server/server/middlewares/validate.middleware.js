import { ZodError } from 'zod';
export const validateRequest = (schema) => async (req, res, next) => {
    try {
        // Validate req.body (or query/params if specified)
        // We parse the body to cast strings to numbers/booleans per Zod schema transforms
        req.body = await schema.parseAsync(req.body);
        next();
    }
    catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                error: 'ValidationError',
                message: 'Invalid request data',
                details: error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
            return;
        }
        res.status(400).json({ error: 'ValidationError', message: 'Unknown validation error' });
    }
};
