const createHttpError = require('./createHttpError')

module.exports = {
  InternalServerError: createHttpError('InternalServerError', 500)
}