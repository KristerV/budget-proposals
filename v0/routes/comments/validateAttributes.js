const yup = require('yup')
const { Comment } = require('../../../database/models')
const { validateSchema } = require('../../utils')
const { BadRequestError } = require('../../errors')

const textSchema = yup.string().min(1)

const createInputSchema = yup.object().shape({
	text: textSchema.required(),
	proposalHash: yup.string().required(),
	parentId: yup.number()
})

const updateInputSchema = yup.object().shape({
	text: textSchema,
	proposalHash: yup.string(),
	parentId: yup.number()
})

const voteInputSchema = yup.object().shape({
	direction: yup
		.number()
		.integer()
		.min(-1)
		.max(1)
		.required()
})

const validateCreateAttributes = async attrs => {
	const errors = await validateSchema(createInputSchema, attrs)
	if (errors) throw new BadRequestError(errors[0])

	if (attrs.parentId) {
		const comment = await Comment.findOne({ id: attrs.parentId })
		if (!comment) throw new BadRequestError('parent comment not found')
	}
}

const validateUpdateAttributes = async (attrs, commentToUpdate) => {
	const errors = await validateSchema(updateInputSchema, attrs)
	if (errors) throw new BadRequestError(errors[0])

	if (attrs.proposalHash && attrs.proposalHash !== commentToUpdate.proposalHash)
		throw new BadRequestError('cannot change proposal hash')

	if (attrs.parentId && attrs.parentId !== commentToUpdate.parentId)
		throw new BadRequestError('cannot change parent comment')
}

const validateVoteAttributes = async attrs => {
	const errors = await validateSchema(voteInputSchema, attrs)
	if (errors) throw new BadRequestError(errors[0])
}

module.exports = {
	validateCreateAttributes,
	validateUpdateAttributes,
	validateVoteAttributes
}
