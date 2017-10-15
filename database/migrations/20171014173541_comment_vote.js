const getDbDriver = require('../getDbDriver')

module.exports.up = async () => {
	const db = await getDbDriver()
	return db.schema.createTable('comment_vote', t => {
		t.timestamp('createdAt').notNullable()
		t.timestamp('updatedAt').notNullable()
		t.integer('direction').notNullable()
		t
			.integer('createdBy')
			.references('id')
			.inTable('user')
			.index()
		t
			.integer('commentId')
			.references('id')
			.inTable('comment')
			.index()

		t.primary(['commentId', 'createdBy'])
	})
}

module.exports.down = async () => {
	const db = await getDbDriver()
	return db.schema.dropTable('comment_vote')
}
