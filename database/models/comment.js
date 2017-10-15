const omit = require('lodash.omit')
const getDbDriver = require('../getDbDriver')
const { createTimestamps, updateTimestamps, deleteTimestamps, withTransaction } = require('./utils')

/**
 * Comment Model
 * @module Comment
 */

const table = 'comment'
const voteTable = 'comment_vote'
const privateFields = ['deletedAt']

/**
 * @typedef Comment
 * @type {object}
 * @property {number} id - the comment id
 * @property {string} text - the text of the comment
 * @property {string} proposalHash - the proposal of the comment
 * @property {number} createdBy - the user that created the comment
 * @property {string} createdAt - the date the comment was created
 * @property {string} updatedAt - the date the comment was last updated
 */

/**
 * @typedef CommentAttributes
 * @type {object}
 * @property {string} text
 * @property {string} proposalHash
 * @property {number} createdBy
 */

/**
 * @typedef CommentVote
 * @type {object}
 * @property {number} direction - the user's vote (1 = like, -1 = dislike, 0 = unvote)
 * @property {number} commentId - the comment of the vote
 * @property {number} createdBy - the user of the vote
 * @property {string} createdAt - the date the vote was created
 * @property {string} updatedAt - the date the vote was last updated
 */

/**
 * @typedef CommentVoteAttributes
 * @type {object}
 * @property {number} direction - the user's vote (1 = like, -1 = dislike, 0 = unvote)
 * @property {number} commentId - the comment of the vote
 * @property {number} createdBy - the user of the vote
 */

/**
 * @function create - creates a new comment
 * @param {CommentAttributes} attrs - the attributes of the comment to create
 * @param {*=} trx - the optional transaction context
 * @return {Promise.<Comment>} - the newly created comment
 */
module.exports.create = async (attrs, trx) => {
	const db = await getDbDriver()
	const [comment] = await withTransaction(trx, db(table).insert(createTimestamps(attrs), '*'))
	return comment
}

/**
 * @function update - updates an existing comment
 * @param {number} id - the id of the comment to update
 * @param {CommentAttributes} attrs - the attributes of the comment to update
 * @param {*=} trx - the optional transaction context
 * @return {Promise.<Comment>} - the updated comment
 */
module.exports.update = async (id, attrs, trx) => {
	const db = await getDbDriver()
	const [comment] = await withTransaction(
		trx,
		db(table)
			.where('id', id)
			.update(updateTimestamps(attrs), '*')
	)

	return comment
}

/**
 * @function - soft deletes a comment
 * @param {number} id - the id of the comment to delete
 * @param {*=} trx - the optional transaction context
 * @return {Promise<?Comment>} - the updated comment
 */
module.exports.delete = async (id, trx) => {
	const db = await getDbDriver()
	const [comment] = await withTransaction(
		trx,
		db(table)
			.where('id', id)
			.update(deleteTimestamps(), '*')
	)

	return comment
}

/**
 * @function findOne - finds an existing comment that matches the provided attributes
 * @param {CommentAttributes} attrs - the attributes of the comment to match against
 * @return {Promise.<?Comment>} - the matched comment, null if not found
 */
module.exports.findOne = async attrs => {
	const db = await getDbDriver()
	const comment = await db
		.first()
		.from(table)
		.where(attrs)

	return comment
}

/**
 * @function findAll - finds all existing comments that match the provided attributes
 * @param {CommentAttributes} attrs - the attributes of the comment to match against
 * @return {Promise.<Comment[]>} - the matched comments
 */
module.exports.findAll = async attrs => {
	const db = await getDbDriver()
	const comments = await db
		.select()
		.from(table)
		.where(attrs)

	return comments
}

/**
 * @function vote - insert or update a users vote for a comment
 * @param {CommentVoteAttributes} voteAttrs - the attributes of the vote
 * @return {Promise.<CommentVote>} - the comment vote
 */
module.exports.vote = async voteAttrs => {
	const { commentId, createdBy, direction } = voteAttrs
	const db = await getDbDriver()
	let vote = await db
		.first()
		.from(voteTable)
		.where({ commentId, createdBy })

	// update existing vote, otherwise create
	if (vote) {
		vote = await db(voteTable)
			.where('id', vote.id)
			.update(updateTimestamps({ direction }), '*')
	} else {
		vote = await db(voteTable).insert(createTimestamps(voteAttrs), '*')
	}

	return vote
}

/**
 * @function toJSON - strips private fields for public consumption
 * @param {Comment} comment - the comment
 * @return {Comment} - the comment without private fields
 */
module.exports.toJSON = comment => {
	return omit(comment, privateFields)
}
