const test = require('ava')
const request = require('supertest')
require('../../../setupTests.js')(test)

const app = require('../../../index.js')
const { User } = require('../../../database/models')
const { UnauthorizedError, NotFoundError } = require('../../errors')
const { signJwt, decodeId, encodeId } = require('../../utils')
const scopes = require('../../scopes')
const { shouldNotAcceptInvalidToken } = require('../../testUtils')

const selfEndpoint = '/v0/users/:id'

async function makeRequest(token, id) {
	const req = request(app).get(selfEndpoint.replace(':id', id))
	if (token) {
		req.set('Authorization', `Bearer ${token}`)
	}
	return req
}

test(
	`GET ${selfEndpoint} should not accept invalid auth token`,
	shouldNotAcceptInvalidToken(makeRequest)
)

test(`GET ${selfEndpoint} should get profile of authenticated user`, async t => {
	const user = await User.create({
		username: 'test',
		password: '123456123456',
		email: 'test@test.com',
		emailConfirmed: false
	})

	const token = await signJwt({ scopes: scopes.user }, { subject: encodeId(user.id) })
	const { status, body } = await makeRequest(token, encodeId(user.id))

	t.is(status, 200, body.message)
	t.truthy(body)
	t.is(decodeId(body.id), user.id)
	t.truthy(new Date(body.createdAt))
	t.is(body.createdAt, body.updatedAt)
	t.is(body.username, user.username)
	t.is(body.email, user.email)
	t.is(body.emailConfirmed, false)
	// private fields, should never be returned by the endpoint
	t.false('password' in body)
})

test(`GET ${selfEndpoint} should not get profile of another user`, async t => {
	const user = await User.create({
		username: 'test',
		password: '123456123456',
		email: 'test@test.com',
		emailConfirmed: false
	})

	const token = await signJwt({ scopes: scopes.user }, { subject: encodeId(2) })
	const { status, body } = await makeRequest(token, encodeId(user.id))

	t.is(status, UnauthorizedError.CODE, body.message)
	t.is(body.code, UnauthorizedError.CODE)
	t.truthy(body.message)
})

test(`GET ${selfEndpoint} should not get profile of non-existent user`, async t => {
	const token = await signJwt({ scopes: scopes.user }, { subject: encodeId(9999) })
	const { status, body } = await makeRequest(token, encodeId(9999))

	t.is(status, NotFoundError.CODE, body.message)
	t.is(body.code, NotFoundError.CODE)
	t.truthy(body.message)
})
