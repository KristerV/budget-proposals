const { auth, json, hashid } = require('../../middleware')
const scopes = require('../../scopes')
// const getComment = require('./getComment')
const createComment = require('./createComment')
const updateComment = require('./updateComment')
// const voteComment = require('./voteComment')
const deleteComment = require('./deleteComment')

const commentHashId = hashid(['id', 'createdBy', 'replyToId'])

module.exports = app => {
	// app.get('/', auth(scopes.user), json(), commentHashId, getComments)
	app.post('/', auth(scopes.user), json(), commentHashId, createComment)
	app.put('/:id', auth(scopes.user), json(), commentHashId, updateComment)
	// app.post('/:id/vote', auth(scopes.user), json(), commentHashId, voteComment)
	app.delete('/:id', auth(scopes.user), json(), commentHashId, deleteComment)
}
