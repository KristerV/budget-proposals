const getDbDriver = require('../getDbDriver')

module.exports.up = async () => {
	const db = await getDbDriver()
	return db.schema.createTable('comment', t => {
		t.increments('id')
		t
			.timestamp('createdAt')
			.notNullable()
			.index()
		t.timestamp('updatedAt').notNullable()
		t.timestamp('deletedAt').index()
		t.text('text').notNullable()
		t
			.string('proposalHash')
			.notNullable()
			.index()
		t
			.integer('createdBy')
			.references('id')
			.inTable('user')
			.index()
		t
			.integer('replyToId')
			.references('id')
			.inTable('comment')
			.index()
	})
}

module.exports.down = async () => {
	const db = await getDbDriver()
	return db.schema.dropTable('comment')
}