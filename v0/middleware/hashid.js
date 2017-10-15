const { encodeId, decodeId } = require('../utils')

const isObject = value => value && typeof value === 'object'
const hasKey = (obj, key) => obj[key] !== null && obj[key] !== undefined

// interates over array or object of arrays and applies the transformer
// function to provided keys
const transformObjectKeys = transformer => (data, keys) => {
	if (Array.isArray(data) && isObject(data[0])) {
		// data is a collection of objects
		data.forEach(obj => {
			keys.forEach(key => {
				if (hasKey(obj, key)) obj[key] = transformer(obj[key])
			})
		})
	} else if (isObject(data)) {
		keys.forEach(key => {
			if (hasKey(data, key)) data[key] = transformer(data[key])
		})
	}
}

const encodeKeys = transformObjectKeys(encodeId)
const decodeKeys = transformObjectKeys(decodeId)

module.exports = function createHashIdMiddleware(idKeys = []) {
	return function hashIdMiddleware(req, res, next) {
		// decode sub in request token
		if (req.token && req.token.sub) {
			req.token.sub = decodeId(req.token.sub)
		}

		// decode keys in request parameters
		if (req.params) {
			decodeKeys(req.params, idKeys)
		}

		// decode keys in query parameters
		if (req.query) {
			decodeKeys(req.query, idKeys)
		}

		// decode keys in request body
		if (req.body) {
			decodeKeys(req.body, idKeys)
		}

		// override res.json to return hash ids
		const oldJson = res.json.bind(res)
		res.json = body => {
			// encode keys in response body
			encodeKeys(body, idKeys)
			oldJson(body)
		}

		next()
	}
}
