const getDbDriver = require('../getDbDriver')

module.exports.up = async () => {
	const db = await getDbDriver()
	return db.schema.createTable('comment', t => {
		t.increments('id')
		t.timestamp('createdAt')
		t.timestamp('updatedAt')
		t.text('text')
		t
			.integer('userId')
			.references('id')
			.inTable('user')
			.index()
		t
			.integer('replyToId')
			.references('id')
			.inTable('comment')
			.index()
			.nullable()
	})
}

module.exports.down = async () => {
	const db = await getDbDriver()
	return db.schema.dropTable('comment')
}
