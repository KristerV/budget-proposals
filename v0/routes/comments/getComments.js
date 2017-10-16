const { Comment } = require('../../../database/models')
const { BadRequestError } = require('../../errors')

module.exports = async (req, res) => {
	const { proposalHash } = req.query

	if (!proposalHash) throw new BadRequestError('proposalHash must be provided')
	const comments = await Comment.findAll({ proposalHash })

	res.json(comments.map(Comment.toJSON))
}
