const bcrypt = require('bcrypt')
const omit = require('lodash.omit')
const getDbDriver = require('../getDbDriver')
const { createTimestamps, updateTimestamps, withTransaction } = require('./utils')

/**
 * User Model
 * @module User
 */

const table = 'user'
const privateFields = ['password']

/**
 * @typedef User
 * @type {object}
 * @property {number} id - the user's id
 * @property {string} username - the user's username
 * @property {string} password - the user's password (will be automatically hashed)
 * @property {string} email - the user's email
 * @property {string} emailConfirmed - whether or not the user's email address has been confirmed
 * @property {string} createdAt - the date the user was created
 * @property {string} updatedAt - the date the user was last updated
 */

/**
 * @typedef UserAttributes
 * @type {object}
 * @property {string} username
 * @property {string} password
 * @property {string} email
 * @property {string} emailConfirmed
 */

/**
 * @typedef UserPublic
 * @type {object}
 * @property {string} id - the hashed user id
 * @property {string} username - the user's username
 * @property {string} email - the user's email
 * @property {string} emailConfirmed - whether or not the user's email address has been confirmed
 * @property {string} createdAt - the date the user was created
 * @property {string} updatedAt - the date the user was last updated
 */

/**
 * @function create - creates a new user
 * @param {UserAttributes} attrs - the attributes of the user to create
 * @param {*=} trx - the optional transaction context
 * @return {Promise.<User>} - the newly created user
 */
module.exports.create = async (attrs, trx) => {
	const db = await getDbDriver()

	attrs.password = await bcrypt.hash(attrs.password, 10)

	const [user] = await withTransaction(trx, db(table).insert(createTimestamps(attrs), '*'))

	return user
}

/**
 * @function update - updates an existing user
 * @param {number} id - the id of the user to update
 * @param {UserAttributes} attrs - the attributes of the user to update
 * @param {*=} trx - the optional transaction context
 * @return {Promise.<User>} - the updated user
 */
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

/**
 * @function findOne - finds an existing user that matches the provided attributes
 * @param {UserAttributes} attrs - the attributes of the user to match against
 * @return {Promise.<?User>} - the matched user, null if not found
 */
module.exports.findOne = async attrs => {
	const db = await getDbDriver()
	const user = await db
		.first()
		.from(table)
		.where(attrs)

	return user
}

/**
 * @function findAll - finds all existing user that match the provided attributes
 * @param {UserAttributes} attrs - the attributes of the user to match against
 * @return {Promise.<User[]>} - the matched users
 */
module.exports.findAll = async attrs => {
	const db = await getDbDriver()
	const user = await db
		.select()
		.from(table)
		.where(attrs)

	return user
}

/**
 * @function comparePassword - compare the user's stored password against the provided one
 * @param {User} user - the user
 * @param {stirng} password - the password to compare the stored password to
 * @return {boolean} - whether or not the password matches
 */
module.exports.comparePassword = async (user, password) => {
	const matches = await bcrypt.compare(password, user.password)
	return matches
}

/**
 * @function toJSON - strips private fields for public consumption
 * @param {User} user - the user
 * @return {UserPublic} - the user without private fields
 */
module.exports.toJSON = user => {
	return omit(user, privateFields)
}
