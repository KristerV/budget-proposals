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

const likes = db => db.raw('count(case direction when 1 then 1 else null end) as likes')
const dislikes = db => db.raw('count(case direction when -1 then 1 else null end) as dislikes')
const score = db => db.raw('coalesce(sum(direction), 0) as score')

module.exports.create = async (attrs, trx) => {
	const db = await getDbDriver()
	const [comment] = await withTransaction(trx, db(table).insert(createTimestamps(attrs), '*'))
	return comment
}

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

module.exports.findOne = async attrs => {
	const db = await getDbDriver()
	const comment = await db
		.first(`${table}.*`, likes(db), dislikes(db), score(db))
		.from(table)
		.leftJoin(voteTable, `${table}.id`, `${voteTable}.commentId`)
		.where(attrs)
		.whereNull('deletedAt') // return nil if comment is deleted
		.groupBy(`${table}.id`)

	return comment
}

module.exports.findAll = async attrs => {
	const db = await getDbDriver()
	// purposefully returning deleted comments to preserve thread
	const comments = await db
		.select(`${table}.*`, likes(db), dislikes(db), score(db))
		.from(table)
		.leftJoin(voteTable, `${table}.id`, `${voteTable}.commentId`)
		.where(attrs)
		.groupBy(`${table}.id`)

	return comments
}

module.exports.vote = async (id, voteAttrs) => {
	const { createdBy, direction } = voteAttrs
	const db = await getDbDriver()
	let vote = await db
		.first()
		.from(voteTable)
		.where({ commentId: id, createdBy })

	// update existing vote, otherwise create
	if (vote) {
		const [updatedVote] = await db(voteTable)
			.where({ commentId: id, createdBy })
			.update(updateTimestamps({ direction }), '*')

		vote = updatedVote
	} else {
		const [createdVote] = await db(voteTable).insert(
			createTimestamps({ commentId: id, createdBy, direction }),
			'*'
		)
		vote = createdVote
	}

	return vote
}

module.exports.toJSON = comment => {
	const json = omit(comment, privateFields)

	if (comment.deletedAt) {
		delete json.text
		delete json.createdBy
		json.deleted = true
	}

	return json
}
