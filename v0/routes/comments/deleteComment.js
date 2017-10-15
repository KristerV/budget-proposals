const { Comment } = require('../../../database/models')
const { UnauthorizedError, BadRequestError, NotFoundError } = require('../../errors')

module.exports = async (req, res) => {
	const { id } = req.params
	const createdBy = req.token.sub

	if (typeof id !== 'number') throw new BadRequestError('invalid comment id')

	const comment = await Comment.findOne({ id })
	if (!comment) throw new NotFoundError('comment not found')
	if (comment.createdBy !== req.token.sub) throw new UnauthorizedError('cannot delete comment')

	await Comment.delete(id)

	res.json(true)
}
