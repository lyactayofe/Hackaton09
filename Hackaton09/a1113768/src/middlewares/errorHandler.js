
function errorHandler(err, _req, res, _next) {
    console.log('[Error Handler]', err);

    if(err.statusCode) {
        return res.status(err.statusCode).json({
            status: 'error',
            code: err.code || 'APP_ERROR',
            message: err.message
        })
    }

    // FallBack 500
    return res.status(500).json({
        status: 'error',
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === "produccion" ? 'error interno del servidor' : err.message
    })
}

function appError(statusCode, code, message) {
    const err = new Error(message);
    err.statusCode = statusCode,
    err.code = code
    return err;
}

module.exports = {errorHandler, appError}