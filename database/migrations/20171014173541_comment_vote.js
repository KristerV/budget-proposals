const getDbDriver = require('../getDbDriver')

module.exports.up = async () => {
	const db = await getDbDriver()
	return db.schema.createTable('comment_vote', t => {
		t.increments('id')
		t.timestamp('createdAt')
		t.timestamp('updatedAt')
		t.integer('direction')
		t
			.integer('userId')
			.references('id')
			.inTable('user')
			.index()
		t
			.integer('commentId')
			.references('id')
			.inTable('comment')
			.index()
	})
}

module.exports.down = async () => {
	const db = await getDbDriver()
	return db.schema.dropTable('comment_vote')
}
