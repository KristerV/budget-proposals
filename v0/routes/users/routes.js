const { auth, json, hashid } = require('../../middleware')
const scopes = require('../../scopes')
const createUser = require('./createUser')
const getUser = require('./getUser')
const updateUser = require('./updateUser')
const confirmEmail = require('./confirmEmail')
const resetPassword = require('./resetPassword')

const userHashId = hashid(['id'])

module.exports = app => {
	app.post('/', json(), userHashId, createUser)
	app.get('/:id', auth(scopes.user), userHashId, getUser)
	app.put('/:id', auth(scopes.user), json(), userHashId, updateUser)
	app.post('/:id/confirmEmail', auth(scopes.userConfirmEmail), json(), userHashId, confirmEmail)
	app.post(
		'/:id/resetPassword',
		auth(scopes.userResetPassword),
		json(),
		userHashId,
		resetPassword
	)
}
