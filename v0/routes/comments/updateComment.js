const { Comment } = require('../../../database/models')
const { UnauthorizedError, BadRequestError, NotFoundError } = require('../../errors')
const { validateUpdateAttributes } = require('./validateAttributes')

module.exports = async (req, res) => {
	const { id } = req.params
	const { text, proposalHash, parentId } = req.body

	if (typeof id !== 'number') throw new BadRequestError('invalid comment id')

	const comment = await Comment.findOne({ id })
	if (!comment) throw new NotFoundError('comment not found')
	// cannot update another user's comment
	if (comment.createdBy !== req.token.sub) throw new UnauthorizedError('cannot update comment')

	await validateUpdateAttributes({ text, parentId, proposalHash }, comment)
	const updatedComment = await Comment.update(id, { text })

	res.json(Comment.toJSON(updatedComment))
}
