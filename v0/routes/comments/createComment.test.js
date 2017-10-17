const test = require('ava')
const request = require('supertest')
const sinon = require('sinon')
require('../../../setupTests.js')(test)

const app = require('../../../index.js')
const { User, Comment } = require('../../../database/models')
const { BadRequestError } = require('../../errors')
const { encodeId, decodeId, signJwt } = require('../../utils')
const scopes = require('../../scopes')
const { shouldNotAcceptInvalidToken } = require('../../testUtils')

const createEndpoint = '/v0/comments'

async function makeRequest(token, attrs) {
	const req = request(app).post(createEndpoint)
	if (token) {
		req.set('Authorization', `Bearer ${token}`)
	}
	return req.send(attrs)
}

test(
	`POST ${createEndpoint} should not accept invalid auth token`,
	shouldNotAcceptInvalidToken(token => makeRequest(token, {}))
)

test(`POST ${createEndpoint} should create comment`, async t => {
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
	const validAttrs = [
		{ text: 'text', proposalHash: 'abc' },
		{ text: 'text', proposalHash: 'abc', parentId: encodeId(comment.id) }
	]

	for (const attrs of validAttrs) {
		const { status, body } = await makeRequest(token, attrs)

		t.is(status, 200, body.message)
		t.truthy(body)
		t.truthy(typeof decodeId(body.id) === 'number')
		t.truthy(new Date(body.createdAt))
		t.is(body.createdAt, body.updatedAt)
		t.is(decodeId(body.createdBy), user.id)
		t.is(body.text, attrs.text)
		if (body.parentId) {
			t.is(decodeId(body.parentId), comment.id)
		}
	}
})

test(`POST ${createEndpoint} should not create comment with invalid attributes`, async t => {
	const user = await User.create({
		username: 'test',
		password: '123456123456'
	})

	const invalidAttrs = [
		null,
		{},
		{ text: null, proposalHash: 'abc' },
		{ text: '', proposalHash: 'abc' },
		{ text: 'text', proposalHash: 'abc', parentId: encodeId(9999) } // non-existent parentId
	]

	const token = await signJwt({ scopes: scopes.user }, { subject: encodeId(user.id) })

	for (const attrs of invalidAttrs) {
		const { status, body } = await makeRequest(token, attrs)

		t.is(status, BadRequestError.CODE, JSON.stringify(attrs))
		t.is(body.code, BadRequestError.CODE)
		t.truthy(body.message)
	}
})
