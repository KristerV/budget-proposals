const { User } = require('../../../database/models')
const mailer = require('../../../mailer')
const { BadRequestError } = require('../../errors')
const { signJwt, encodeId } = require('../../utils')
const scopes = require('../../scopes')
const { validateCreateAttributes } = require('./validateAttributes')

module.exports = async (req, res) => {
	const { username, email, password } = req.body

	await validateCreateAttributes({ username, email, password })

	const user = await User.create({
		username,
		email,
		password,
		emailConfirmed: false
	})

	if (email) {
		const token = await signJwt(
			{ scopes: scopes.userConfirmEmail },
			{ subject: encodeId(user.id), expiresIn: '5m' }
		)

		await mailer.sendEmailConfirmation(user.email, encodeId(user.id), token)
	}

	res.json(User.toJSON(user))
}
