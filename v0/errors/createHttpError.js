const httpErrorIdentifier = Symbol('httpError')

module.exports.createHttpError = (name, code) => {
	class HttpError extends Error {
		constructor(message) {
			super(message)

			// error details
			this.name = name
			this.message = message
			this.code = code
			this[httpErrorIdentifier] = true

			// add stack trace to error object
			Error.captureStackTrace(this, this.constructor)
		}
	}

	// static constant used for tests
	HttpError.CODE = code

	return HttpError
}

module.exports.isHttpError = error => !!error[httpErrorIdentifier]
