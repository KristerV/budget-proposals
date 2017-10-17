const { auth, json, hashid } = require('../../middleware')
const scopes = require('../../scopes')
const getComments = require('./getComments')
const createComment = require('./createComment')
const updateComment = require('./updateComment')
const voteComment = require('./voteComment')
const deleteComment = require('./deleteComment')

const commentHashId = hashid(['id', 'createdBy', 'parentId'])

module.exports = app => {
	app.get('/', commentHashId, getComments)
	app.post('/', auth(scopes.user), json(), commentHashId, createComment)
	app.put('/:id', auth(scopes.user), json(), commentHashId, updateComment)
	app.post('/:id/vote', auth(scopes.user), json(), commentHashId, voteComment)
	app.delete('/:id', auth(scopes.user), json(), commentHashId, deleteComment)
}
