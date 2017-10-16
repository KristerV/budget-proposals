const { isHttpError, InternalServerError } = require('../errors')

module.exports = function createErrorsMiddleware() {
	return function errorsMiddleware(err, req, res, next) {
		// unexpected error
		if (!isHttpError(err)) {
			console.error(err)
			err = new InternalServerError(err.message)
		}

		// TODO: when logging is added, obfuscate error messages with code >= 500
		// and remove stack traces in production
		res.status(err.code).json({
			code: err.code,
			message: err.message,
			stack: err.stack
		})
	}
}
