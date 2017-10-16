const { Comment } = require('../../../database/models')
const { UnauthorizedError, BadRequestError, NotFoundError } = require('../../errors')
const { validateVoteAttributes } = require('./validateAttributes')

module.exports = async (req, res) => {
	const { id } = req.params
	const { direction } = req.body
	const createdBy = req.token.sub

	if (typeof id !== 'number') throw new BadRequestError('invalid comment id')

	const comment = await Comment.findOne({ id })
	if (!comment) throw new NotFoundError('comment not found')
	if (comment.createdBy === createdBy)
		throw new BadRequestError('cannot vote on your own comment')

	await validateVoteAttributes({ direction }, comment)
	await Comment.vote(comment.id, { direction, createdBy })
	const votedComment = await Comment.findOne({ id })

	res.json(Comment.toJSON(votedComment))
}
