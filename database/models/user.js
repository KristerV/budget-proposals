const bcrypt = require('bcrypt')
const omit = require('lodash.omit')
const getDbDriver = require('../getDbDriver')
const { createTimestamps, updateTimestamps, withTransaction } = require('./utils')

const table = 'user'
const privateFields = ['password']

module.exports.create = async (attrs, trx) => {
	const db = await getDbDriver()
	attrs.password = await bcrypt.hash(attrs.password, 10)
	const [user] = await withTransaction(trx, db(table).insert(createTimestamps(attrs), '*'))

	return user
}

module.exports.update = async (id, attrs, trx) => {
	const db = await getDbDriver()

	if (attrs.password) {
		attrs.password = await bcrypt.hash(attrs.password, 10)
	}

	const [user] = await withTransaction(
		trx,
		db(table)
			.where('id', id)
			.update(updateTimestamps(attrs), '*')
	)

	return user
}

module.exports.findOne = async attrs => {
	const db = await getDbDriver()
	const user = await db
		.first()
		.from(table)
		.where(attrs)

	return user
}

module.exports.findAll = async attrs => {
	const db = await getDbDriver()
	const user = await db
		.select()
		.from(table)
		.where(attrs)

	return user
}

module.exports.comparePassword = async (user, password) => {
	const matches = await bcrypt.compare(password, user.password)
	return matches
}

module.exports.toJSON = user => {
	return omit(user, privateFields)
}
