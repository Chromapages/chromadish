export const errorHandler = (err, req, res, next) => {
    console.error('[Global Error Guard]', err);
    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        error: err.name || 'Error',
        message: message,
        // Provide details in dev, scrub in prod
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};
