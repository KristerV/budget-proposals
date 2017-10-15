require('dotenv').config({ path: '.env.test' })

const cleaner = require('knex-cleaner')
const getDbDriver = require('./database/getDbDriver')
const mock = require('mock-require')

const mockMailer = {
	sendPasswordReset: () => Promise.resolve(),
	sendEmailConfirmation: () => Promise.resolve()
}

mock('./mailer', mockMailer)

module.exports = test => {
	// migrate the database before running the test suite
	test.before(async t => {
		const db = await getDbDriver()
		await db.migrate.latest()
	})

	// set mock mailer context before each test
	test.beforeEach(async t => {
		t.context.mailer = mockMailer
	})

	// after each test, truncate all tables
	// don't truncate migration tables because rollback checks for which migrations ran
	test.afterEach.always(async () => {
		const db = await getDbDriver()
		await cleaner.clean(db, {
			mode: 'truncate',
			ignoreTables: ['migration', 'migration_lock']
		})
	})

	// rollback the database after test suite has completed
	test.after.always(async () => {
		const db = await getDbDriver()
		await db.migrate.rollback()
	})
}
