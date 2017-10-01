// NOTE: this module is mocked for testing, any methods added to the
// return type of getClient need to be mocked in setupTests.js
const getClient = require('./getClient')

module.exports.sendEmailConfirmation = async (to, userId, token) => {
	const client = getClient()
	const url = `${process.env.FRONTEND_URL}/confirmEmail?userId=${userId}&token=${token}`
	return client.send({
		to,
		from: process.env.SUPPORT_EMAIL,
		subject: 'Email Confirmation',
		text: `Confirm your email: ${url}`,
		html: `<a href=${url}>Confirm your email</a>`
	})
}

module.exports.sendPasswordReset = async (to, userId, token) => {
	const client = getClient()
	const url = `${process.env.FRONTEND_URL}/changePassword?userId=${userId}&token=${token}`
	return client.send({
		to,
		from: process.env.SUPPORT_EMAIL,
		subject: 'Reset Password',
		text: `Reset your password: ${url}`,
		html: `<a href=${url}>Reset your password</a>`
	})
}
