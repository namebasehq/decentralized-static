const crypto = require('crypto')
const http = require('http')


async function uploadFileFromPopup(address, port, body, message) {

	const hash = crypto.createHash('sha256')
	hash.update(body)
	const file_hash = await hash.digest('hex')

	let source = '/' + file_hash
	let fspath = file_hash 

	let url = '/renter/upload' + '?source=' + source + '&fspath=' + fspath + '&local=' + false 

	const options = {
		hostname: address,
		port: port,
		path: url,
		method: 'POST',
		headers: {
			'Content-Type' : 'application/json',
			'Accept' : 'application/json'
		}
	}
	
	upload_page.innerText = 'Put the following hash in the DS record for domain : ' + file_hash

	const req = http.request(options)

	req.write(body)

	req.end()

	return file_hash
}


module.exports = uploadFileFromPopup
