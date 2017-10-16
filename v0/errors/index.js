const { createHttpError, isHttpError } = require('./createHttpError')

module.exports = {
	isHttpError,
	BadRequestError: createHttpError('BadRequestError', 400),
	UnauthorizedError: createHttpError('UnauthorizedError', 401),
	ForbiddenError: createHttpError('ForbiddenError', 403),
	NotFoundError: createHttpError('NotFoundError', 404),
	InternalServerError: createHttpError('InternalServerError', 500)
}
