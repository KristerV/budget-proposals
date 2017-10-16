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

const voteEndpoint = '/v0/comments/:id/vote'

async function makeRequest(token, id, attrs) {
	const req = request(app).post(voteEndpoint.replace(':id', id))
	if (token) {
		req.set('Authorization', `Bearer ${token}`)
	}
	return req.send(attrs)
}

test(
	`POST ${voteEndpoint} should not accept invalid auth token`,
	shouldNotAcceptInvalidToken(token => makeRequest(token, 'id', {}))
)

test(`POST ${voteEndpoint} should like comment`, async t => {
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
	const { status, body } = await makeRequest(token, encodeId(comment.id), { direction: 1 })

	t.is(status, 200, body.message)
	t.is(decodeId(body.id), comment.id)
	t.is(body.likes, 1)
	t.is(body.dislikes, 0)
	t.is(body.score, 1)
})

test(`POST ${voteEndpoint} should dislike comment`, async t => {
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
	const { status, body } = await makeRequest(token, encodeId(comment.id), { direction: -1 })

	t.is(status, 200, body.message)
	t.is(decodeId(body.id), comment.id)
	t.is(body.likes, 0)
	t.is(body.dislikes, 1)
	t.is(body.score, -1)
})

test(`POST ${voteEndpoint} should reset vote`, async t => {
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

	await Comment.vote(comment.id, { direction: 1, createdBy: user.id })

	const token = await signJwt({ scopes: scopes.user }, { subject: encodeId(user.id) })
	const { status, body } = await makeRequest(token, encodeId(comment.id), { direction: 0 })

	t.is(status, 200, body.message)
	t.is(decodeId(body.id), comment.id)
	t.is(body.likes, 0)
	t.is(body.dislikes, 0)
	t.is(body.score, 0)
})

test(`POST ${voteEndpoint} return zeros for comments with no votes`, async t => {
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
	const { status, body } = await makeRequest(token, encodeId(comment.id), { direction: 0 })

	t.is(status, 200, body.message)
	t.is(decodeId(body.id), comment.id)
	t.is(body.likes, 0)
	t.is(body.dislikes, 0)
	t.is(body.score, 0)
})

test(`POST ${voteEndpoint} should not vote with invalid comment id`, async t => {
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

test(`POST ${voteEndpoint} should not vote comment with invalid attributes`, async t => {
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

	const invalidAttrs = [null, {}, { direction: null }, { direction: -2 }, { direction: 2 }]
	const token = await signJwt({ scopes: scopes.user }, { subject: encodeId(user.id) })

	for (const attrs of invalidAttrs) {
		const { status, body } = await makeRequest(token, encodeId(comment.id), attrs)

		t.is(status, BadRequestError.CODE, JSON.stringify(attrs))
		t.is(body.code, BadRequestError.CODE)
		t.truthy(body.message)
	}
})

test(`POST ${voteEndpoint} should not vote on non-existent comment`, async t => {
	const user = await User.create({
		username: 'test',
		password: '123456123456'
	})

	const token = await signJwt({ scopes: scopes.user }, { subject: encodeId(user.id) })
	const { status, body } = await makeRequest(token, encodeId(9999), {})

	t.is(status, NotFoundError.CODE, body.message)
	t.is(body.code, NotFoundError.CODE)
	t.truthy(body.message)
})

test(`POST ${voteEndpoint} should not allowed users to vote on their own comment`, async t => {
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
	const { status, body } = await makeRequest(token, encodeId(comment.id), { direction: 1 })

	t.is(status, BadRequestError.CODE, body.message)
	t.is(body.code, BadRequestError.CODE)
	t.truthy(body.message)
})
