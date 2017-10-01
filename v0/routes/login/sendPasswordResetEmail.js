const mailer = require('../../../mailer')
const { User } = require('../../../database/models')
const { NotFoundError, BadRequestError } = require('../../errors')
const { signJwt, encodeId } = require('../../utils')
const scopes = require('../../scopes')

module.exports = async (req, res) => {
	const { email } = req.body
	if (!email) throw new BadRequestError('invalid email')

	const user = await User.findOne({ email })
	if (!user) throw new NotFoundError('user not found')

	const token = await signJwt(
		{ scopes: scopes.userResetPassword },
		{ subject: encodeId(user.id), expiresIn: '5m' }
	)

	await mailer.sendPasswordReset(user.email, encodeId(user.id), token)

	res.json(true)
}
