require('dotenv').config()
const http = require('http')


async function querySia(url, method, body = undefined) {

	const options = {
		hostname: process.env.FILESYSTEM_ADDRESS,
		port: process.env.FILESYSTEM_PORT,
		path: url,
		method: method,
		headers: {
			'Content-Type' : 'application/json',
			'Accept' : 'application/json'
		}
	}
	
	const req = http.request(options)

	if (body) {
		req.write(body)
	}

	req.end()
	
	return new Promise((resolve, reject) => {
		req.on('response', res => {
			result = []
			res.on('data', data => {
				result.push(data)
			})
			res.on('end', () => {
				resolve(Buffer.concat(result))
			})
		})
	})
}


module.exports = querySia
