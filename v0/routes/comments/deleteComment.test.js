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

const deleteEndpoint = '/v0/comments/:id'

async function makeRequest(token, id) {
	const req = request(app).delete(deleteEndpoint.replace(':id', id))
	if (token) {
		req.set('Authorization', `Bearer ${token}`)
	}
	return req.send()
}

test(
	`DELETE ${deleteEndpoint} should not accept invalid auth token`,
	shouldNotAcceptInvalidToken(token => makeRequest(token, 'id'))
)

test(`DELETE ${deleteEndpoint} should delete comment`, async t => {
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
	const { status, body } = await makeRequest(token, encodeId(comment.id))

	t.is(status, 200, body)
	t.is(body, true)

	const deletedComment = await Comment.findOne({ id: comment.id })
	t.is(deletedComment, undefined)
})

test(`DELETE ${deleteEndpoint} should not update with invalid comment id`, async t => {
	const user = await User.create({
		username: 'test',
		password: '123456123456'
	})

	const invalidIds = [null, undefined, 'invalid', 0, 1]
	const token = await signJwt({ scopes: scopes.user }, { subject: encodeId(user.id) })

	for (const id of invalidIds) {
		const { status, body } = await makeRequest(token, id)

		t.is(status, BadRequestError.CODE, id)
		t.is(body.code, BadRequestError.CODE)
		t.truthy(body.message)
	}
})

test(`DELETE ${deleteEndpoint} should not delete comment of another user`, async t => {
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
	const { status, body } = await makeRequest(token, encodeId(comment.id))

	t.is(status, UnauthorizedError.CODE, body.message)
	t.is(body.code, UnauthorizedError.CODE)
	t.truthy(body.message)
})

test(`DELETE ${deleteEndpoint} should not delete a non-existent comment`, async t => {
	const user = await User.create({
		username: 'test',
		password: '123456123456'
	})

	const token = await signJwt({ scopes: scopes.user }, { subject: encodeId(user.id) })
	const { status, body } = await makeRequest(token, encodeId(9999))

	t.is(status, NotFoundError.CODE, body.message)
	t.is(body.code, NotFoundError.CODE)
	t.truthy(body.message)
})
