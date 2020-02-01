require('dotenv').config()
const query = require('./query')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const bt = require('buffer-type')


async function download(fspath, destination) {

	let url = '/renter/download' + '?fspath=' + fspath + '&destination=' + destination + '&local=' + process.env.LOCAL_FILESYSTEM
	let method = 'GET'

	const file_data = await query(url, method)
	
	await fs.mkdir(path.dirname(destination), { recursive: true }, function (){})
	await fs.writeFile(destination, file_data, err => {
		if (err) {
			console.log('Error writing file: ' + err.toString())
		}
	})
}

async function upload(source) {

	const file_data =  await new Promise((resolve, reject) => {
		fs.readFile(source, (err, data) => {
			if (err) {
				console.log('Error reading file ' + source + ': ' + err.toString())
			}
			resolve(data)
		})
	})

	console.log('file_type', bt(file_data))	

	const hash = crypto.createHash('sha256')
	hash.update(file_data)
	const file_hash = hash.digest('hex')

	let url = '/renter/upload' + '?source=' + source + '&fspath=' + fspath + '&local=' + process.env.LOCAL_FILESYSTEM
	let method = 'POST'
	let body = file_data
	
	const res = query(url, method, body)
}


module.exports.download = download
module.exports.upload = upload
