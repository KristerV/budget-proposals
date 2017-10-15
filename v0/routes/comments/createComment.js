const { Comment } = require('../../../database/models')
const { validateCreateAttributes } = require('./validateAttributes')

module.exports = async (req, res) => {
	const { text, proposalHash, replyToId } = req.body
	const createdBy = req.token.sub

	await validateCreateAttributes({ text, proposalHash, replyToId })
	const comment = await Comment.create({ text, replyToId, proposalHash, createdBy })

	res.json(Comment.toJSON(comment))
}
