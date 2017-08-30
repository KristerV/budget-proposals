const utils = require('../../utils')
const runcli = require('../core-utils').runCliCmd
const statuses = require('./statuses')

module.exports = function(app) {

	app.get('/', async (req, res) => {
		const data = await runcli(['gobject', 'list'])
		const withStatuses = await statuses.addListStatuses(data)
		let proposalsList = Object.values(withStatuses)
		if (req.query.status)
			proposalsList = proposalsList.filter(proposal => req.query.status === proposal.status)

		res.json(proposalsList)
	})

	app.get('/:hash', async (req, res) => {
		const data = await runcli(['gobject', 'get', req.params.hash])
		res.json(data)
	})

}
