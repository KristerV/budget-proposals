const { User } = require('../../../database/models')
const mailer = require('../../../mailer')
const { UnauthorizedError, BadRequestError, NotFoundError } = require('../../errors')
const { signJwt, encodeId } = require('../../utils')
const scopes = require('../../scopes')
const { validateUpdateAttributes } = require('./validateAttributes')

module.exports = async (req, res) => {
	const { id } = req.params
	const { username, email, password } = req.body
	// cannot update another user
	if (id !== req.token.sub) throw new UnauthorizedError('cannot update user')

	const user = await User.findOne({ id: req.token.sub })
	if (!user) throw new NotFoundError('user not found')

	await validateUpdateAttributes({ username, email, password }, user)

	let emailConfirmed

	// if email is being updated, send new confirmation email
	if (email && email !== user.email) {
		emailConfirmed = false
		const token = await signJwt(
			{ scopes: scopes.userConfirmEmail },
			{ subject: encodeId(user.id), expiresIn: '5m' }
		)

		await mailer.sendEmailConfirmation(user.email, encodeId(user.id), token)
	}

	const updatedUser = await User.update(user.id, {
		email,
		password,
		emailConfirmed
	})

	res.json(User.toJSON(updatedUser))
}
