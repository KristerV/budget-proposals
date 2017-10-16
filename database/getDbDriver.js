const pg = require('pg')
const knex = require('knex')
const config = require('./config')

// aggregate functions like sum and count return bigints, which pg parses as strings
// this tells pg to parse bigints as integers
pg.types.setTypeParser(20, 'text', parseInt)

let driver

/**
 * Attempts to return a connection to the database and retry if it fails.
 *
 * Useful in a testing environment where the db may not be in a ready state
 * before the tests are run
 */
module.exports = async function getDbDriver() {
	if (driver) return Promise.resolve(driver)

	const delay = 10000 // 10 seconds
	const maxRetries = 12 // 2 minutes
	let retries = 0

	return new Promise((resolve, reject) => {
		function wait() {
			if (retries > maxRetries) {
				return Promise.reject(
					new Error(`Failed to connect to the database after ${retries} retries.`)
				)
			}

			driver = knex(config)
			driver
				.raw('SELECT 1 + 1')
				.then(() => resolve(driver))
				.catch(err => {
					console.warn(
						`Database connection failed with '${err.message}', waiting ${delay /
							1000} seconds before retrying...`
					)

					retries += 1
					setTimeout(wait, delay)
				})
		}

		wait()
	})
}
