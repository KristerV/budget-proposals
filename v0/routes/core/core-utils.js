const { execFile } = require('child-process-promise')
const conf = require('../../config')
const { InternalServerError } = require('../../errors')

const maxBuffer = 1024 * 500 // 512kb

module.exports.runCliCmd = async function(args) {
	let data

	if (typeof args === 'string') args = [args]

	try {
		const { stdout } = await execFile(conf['cli-command'], args, { maxBuffer })
		data = stdout
		data.status = 200
	} catch (e) {
		throw new InternalServerError(e.toString().replace(/\n/g, '; '))
	}

	// Try return an object
	if (typeof data === 'string') {
		try {
			data = JSON.parse(data)
		} catch (e) {
			console.debug('runCliCmd: Data is not JSON')
		}
	}

	return data
}
