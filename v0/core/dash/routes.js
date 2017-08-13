const utils = require('../../utils')
const runcli = require('../runCliCmd')

module.exports = function(app) {
	const commands = [
		'getgovernanceinfo',
		'getpoolinfo',
		'mnsync status',
		'masternodelist'
	]

	commands.forEach(route => {
		let spaceless = route.replace(/ /g, '-')
		app.get('/'+spaceless, async (req, res) => {
			const data = await runcli(route)
			res.send(utils.formatResponse(data, req))
		})
	})
	
}