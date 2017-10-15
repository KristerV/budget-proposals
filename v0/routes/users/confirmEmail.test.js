const test = require('ava')
const request = require('supertest')
require('../../../setupTests.js')(test)

const app = require('../../../index.js')
const { User } = require('../../../database/models')
const { NotFoundError, UnauthorizedError } = require('../../errors')
const { signJwt, decodeId, encodeId } = require('../../utils')
const scopes = require('../../scopes')
const { shouldNotAcceptInvalidToken } = require('../../testUtils')

const confirmEmailEndpoint = '/v0/users/:id/confirmEmail'

async function makeRequest(token, id) {
	const req = request(app).post(confirmEmailEndpoint.replace(':id', id))
	if (token) {
		req.set('Authorization', `Bearer ${token}`)
	}
	return req
}

test(
	`POST ${confirmEmailEndpoint} should not accept invalid auth token`,
	shouldNotAcceptInvalidToken(makeRequest)
)

test(`POST ${confirmEmailEndpoint} should update confirmed email for user`, async t => {
	const user = await User.create({
		username: 'test',
		password: '123456',
		email: 'test@test.com',
		emailConfirmed: false
	})

	const token = await signJwt({ scopes: scopes.userConfirmEmail }, { subject: encodeId(user.id) })
	const { status, body } = await makeRequest(token, encodeId(user.id))

	t.is(status, 200, body.message)
	t.truthy(body)
	t.is(decodeId(body.id), user.id)
	t.truthy(new Date(body.updatedAt) > new Date(body.createdAt))
	t.is(body.emailConfirmed, true)
})

test(`POST ${confirmEmailEndpoint} should not confirm email for another user`, async t => {
	const user = await User.create({
		username: 'test',
		password: '123456',
		email: 'test@test.com',
		emailConfirmed: false
	})

	const otherUser = await User.create({
		username: 'test-other',
		password: '123456',
		email: 'test-other@test.com',
		emailConfirmed: false
	})

	const token = await signJwt({ scopes: scopes.user }, { subject: encodeId(user.id) })
	const { status, body } = await makeRequest(token, encodeId(otherUser.id))

	t.is(status, UnauthorizedError.CODE, body.message)
	t.is(body.code, UnauthorizedError.CODE)
	t.truthy(body.message)
})
