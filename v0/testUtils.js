const { User } = require('../database/models')
const { UnauthorizedError } = require('./errors')
const { signJwt } = require('./utils')

module.exports.shouldNotAcceptInvalidToken = makeRequest => async t => {
	const user = await User.create({
		username: 'test',
		password: '123456',
		email: 'test@test.com',
		emailConfirmed: false
	})

	const expiredToken = await signJwt(
		// backdate token 2 seconds
		{ iat: Math.floor(Date.now() / 1000) - 2 },
		// set token to expire in 1 second
		{ expiresIn: '1s' }
	)
	const invalidScopeTokens = await Promise.all([
		signJwt({ scopes: [] }, { subject: `${user.id}`, expiresIn: '10h' }),
		signJwt({ scopes: 'invalid' }, { subject: `${user.id}`, expiresIn: '10h' })
	])
	const invalidTokens = [null, 'invalid', expiredToken, ...invalidScopeTokens]

	for (const token of invalidTokens) {
		const { status, body } = await makeRequest(token, user.id)

		t.is(status, UnauthorizedError.CODE, body.message)
		t.is(body.code, UnauthorizedError.CODE)
		t.truthy(body.message)
	}
}
