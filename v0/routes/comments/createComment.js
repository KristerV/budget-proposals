const { Comment } = require('../../../database/models')
const { validateCreateAttributes } = require('./validateAttributes')

module.exports = async (req, res) => {
	const { text, proposalHash, parentId } = req.body
	const createdBy = req.token.sub

	await validateCreateAttributes({ text, proposalHash, parentId })
	const comment = await Comment.create({ text, parentId, proposalHash, createdBy })

	res.json(Comment.toJSON(comment))
}
