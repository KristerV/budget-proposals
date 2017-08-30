const { execFile } = require('child-process-promise')
const conf = require('../config')
const { InternalServerError } = require('../errors')

module.exports.runCliCmd = async function(options) {
	let data

	if (typeof options === 'string')
		options = [options]

	try {
		const { stdout } = await execFile(conf["cli-command"], options)
		data = stdout
		data.status = 200
	} catch(e) {
		throw new InternalServerError(e.toString().replace(/\n/g, '; '))
	}

	// Try return an object
	if (typeof data === 'string') {
		try {
			data = JSON.parse(data)
		} catch(e) {console.debug("runCliCmd: Data is not JSON")}
	}

	return data
}