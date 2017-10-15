const test = require('ava')
const request = require('supertest')
const sinon = require('sinon')
require('../../../setupTests.js')(test)

const app = require('../../../index.js')
const { User, Comment } = require('../../../database/models')
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../../errors')
const { encodeId, decodeId, signJwt } = require('../../utils')
const scopes = require('../../scopes')
const { shouldNotAcceptInvalidToken } = require('../../testUtils')

const updateEndpoint = '/v0/comments/:id'

async function makeRequest(token, id, attrs) {
	const req = request(app).put(updateEndpoint.replace(':id', id))
	if (token) {
		req.set('Authorization', `Bearer ${token}`)
	}
	return req.send(attrs)
}

test(
	`PUT ${updateEndpoint} should not accept invalid auth token`,
	shouldNotAcceptInvalidToken(token => makeRequest(token, 'id', {}))
)

test(`PUT ${updateEndpoint} should update comment`, async t => {
	const user = await User.create({
		username: 'test',
		password: '123456123456'
	})

	const comment = await Comment.create({
		text: 'text',
		proposalHash: 'abc',
		createdBy: user.id
	})

	const token = await signJwt({ scopes: scopes.user }, { subject: encodeId(user.id) })
	const validAttrs = [{ text: 'updated' }]

	for (const attrs of validAttrs) {
		const { status, body } = await makeRequest(token, encodeId(comment.id), attrs)

		t.is(status, 200, body.message)
		t.truthy(body)
		t.truthy(typeof decodeId(body.id) === 'number')
		t.truthy(new Date(body.createdAt))
		t.truthy(new Date(body.updatedAt) > new Date(body.createdAt))
		t.is(decodeId(body.createdBy), user.id)
		t.is(body.text, attrs.text)
	}
})

test(`PUT ${updateEndpoint} should not update with invalid comment id`, async t => {
	const user = await User.create({
		username: 'test',
		password: '123456123456'
	})

	const invalidIds = [null, undefined, 'invalid', 0, 1]
	const token = await signJwt({ scopes: scopes.user }, { subject: encodeId(user.id) })

	for (const id of invalidIds) {
		const { status, body } = await makeRequest(token, id, {})

		t.is(status, BadRequestError.CODE, id)
		t.is(body.code, BadRequestError.CODE)
		t.truthy(body.message)
	}
})

test(`PUT ${updateEndpoint} should not update comment with invalid attributes`, async t => {
	const user = await User.create({
		username: 'test',
		password: '123456123456'
	})

	const comment = await Comment.create({
		text: 'text',
		proposalHash: 'abc',
		createdBy: user.id
	})

	const invalidAttrs = [
		{ text: null },
		{ proposalHash: null },
		{ proposalHash: 'updated' },
		{ replyToId: null },
		{ replyToId: encodeId(9999) }
	]

	const token = await signJwt({ scopes: scopes.user }, { subject: encodeId(user.id) })

	for (const attrs of invalidAttrs) {
		const { status, body } = await makeRequest(token, encodeId(comment.id), attrs)

		t.is(status, BadRequestError.CODE, JSON.stringify(attrs))
		t.is(body.code, BadRequestError.CODE)
		t.truthy(body.message)
	}
})

test(`PUT ${updateEndpoint} should not update comment of another user`, async t => {
	const user = await User.create({
		username: 'test',
		password: '123456123456'
	})

	const otherUser = await User.create({
		username: 'other',
		password: '123456123456'
	})

	const comment = await Comment.create({
		text: 'text',
		proposalHash: 'abc',
		createdBy: otherUser.id
	})

	const token = await signJwt({ scopes: scopes.user }, { subject: encodeId(user.id) })
	const { status, body } = await makeRequest(token, encodeId(comment.id), { text: 'updated' })

	t.is(status, UnauthorizedError.CODE, body.message)
	t.is(body.code, UnauthorizedError.CODE)
	t.truthy(body.message)
})

test(`PUT ${updateEndpoint} should not update a non-existent comment`, async t => {
	const user = await User.create({
		username: 'test',
		password: '123456123456'
	})

	const token = await signJwt({ scopes: scopes.user }, { subject: encodeId(user.id) })
	const { status, body } = await makeRequest(token, encodeId(9999), { text: 'updated' })

	t.is(status, NotFoundError.CODE, body.message)
	t.is(body.code, NotFoundError.CODE)
	t.truthy(body.message)
})
