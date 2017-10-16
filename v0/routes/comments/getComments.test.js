const test = require('ava')
const request = require('supertest')
const sinon = require('sinon')
require('../../../setupTests.js')(test)

const app = require('../../../index.js')
const { User, Comment } = require('../../../database/models')
const { BadRequestError } = require('../../errors')
const { encodeId, decodeId } = require('../../utils')

const getAllEndpoint = '/v0/comments'

async function makeRequest(proposalHash) {
	return request(app).get(
		`${getAllEndpoint}/?${proposalHash ? `proposalHash=${proposalHash}` : ''}`
	)
}

test(`GET ${getAllEndpoint} should return comments`, async t => {
	const proposalHash = 'abc'

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
		proposalHash,
		createdBy: user.id
	})

	const otherUserComment = await Comment.create({
		text: 'other',
		proposalHash,
		replyToId: comment.id,
		createdBy: otherUser.id
	})

	const otherProposalComment = await Comment.create({
		text: 'otherproposal',
		proposalHash: 'other',
		createdBy: user.id
	})

	const deletedComment = await Comment.create({
		text: 'deleted',
		proposalHash,
		createdBy: user.id
	})

	await Comment.vote(comment.id, { direction: 1, createdBy: otherUser.id })
	await Comment.vote(otherUserComment.id, { direction: -1, createdBy: user.id })
	await Comment.delete(deletedComment.id)

	const { status, body } = await makeRequest(proposalHash)
	t.is(status, 200, body)
	t.true(Array.isArray(body))
	t.is(body.length, 3)

	const retComment = body.find(c => decodeId(c.id) === comment.id)
	t.truthy(retComment)
	t.truthy(retComment.createdAt)
	t.truthy(retComment.updatedAt)
	t.is(retComment.text, comment.text)
	t.is(retComment.proposalHash, comment.proposalHash)
	t.is(decodeId(retComment.createdBy), user.id)
	t.is(retComment.replyToId, null)
	t.is(retComment.likes, 1)
	t.is(retComment.dislikes, 0)
	t.is(retComment.score, 1)

	const retOtherUserComment = body.find(c => decodeId(c.id) === otherUserComment.id)
	t.truthy(retOtherUserComment)
	t.truthy(retOtherUserComment.createdAt)
	t.truthy(retOtherUserComment.updatedAt)
	t.is(retOtherUserComment.text, otherUserComment.text)
	t.is(retOtherUserComment.proposalHash, otherUserComment.proposalHash)
	t.is(decodeId(retOtherUserComment.createdBy), otherUser.id)
	t.is(decodeId(retOtherUserComment.replyToId), comment.id)
	t.is(retOtherUserComment.likes, 0)
	t.is(retOtherUserComment.dislikes, 1)
	t.is(retOtherUserComment.score, -1)

	const retDeletedComment = body.find(c => decodeId(c.id) === deletedComment.id)
	t.truthy(retDeletedComment)
	t.truthy(retDeletedComment.createdAt)
	t.truthy(retDeletedComment.updatedAt)
	t.is(retDeletedComment.deleted, true)
	t.is(retDeletedComment.text, undefined)
	t.is(retDeletedComment.proposalHash, deletedComment.proposalHash)
	t.is(decodeId(retDeletedComment.createdBy), undefined)
	t.is(retDeletedComment.replyToId, null)
	t.is(retDeletedComment.likes, 0)
	t.is(retDeletedComment.dislikes, 0)
	t.is(retDeletedComment.score, 0)
})

test(`GET ${getAllEndpoint} require proposalHash`, async t => {
	const { status, body } = await makeRequest()
	t.is(status, BadRequestError.CODE, body)
	t.is(body.code, BadRequestError.CODE)
	t.truthy(body.message)
})
