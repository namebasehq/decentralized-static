require('dotenv').config()
const process = require('process')
const query = require('./query.js')
const fs = require('fs')
const http = require('http')
const { URL } = require('url')
const HandshakeResolver = require('./hsResolver.js').HandshakeResolver
const LRUcache = require('./fileLRUcache.js')
const crypto = require('crypto')
const UploadServer =  require('./server/server.js')
const FileType = require('file-type')
const mime = require('mime-types')

const filesystem_api = require(process.env.FILESYSTEM_API)
var resolver = undefined
var file_cache = new LRUcache(process.env.MAX_LOCALLY_STORED_SITES)


class Gateway {

	constructor() {
		console.log('Constructing gateway')
		resolver = new HandshakeResolver()
	
		this.uploadServer = new UploadServer(process.env.UPLOAD_SERVER_PORT)

		this.httpServer= http.createServer()
		this.httpServer.on('request', this.handleHttpRequest)
		this.httpServer.on('listening', () => console.log('Gateway server listening on', '127.53.53.53:53:80'))
	}

	async open() {
		
		this.httpServer.listen('80', '127.53.53.53')

		this.uploadServer.open()
	}

	async handleHttpRequest(request, response) {
		
		if (request) {
			console.log(request.url)
		}

		let domain_name = request.headers.host
		console.log('Request for', domain_name)
		
		//Retrieve the hash of the content from the DS record
		let ds_hash = await resolver.getDS(domain_name)

		//Check if content already exists in local directory
		if (!file_cache.has(domain_name)) {
			console.log('File not in cache')
			await filesystem_api.download(ds_hash, process.env.LOCAL_SERVER_DIRECTORY + '/' + ds_hash)
			file_cache.set(domain_name, ds_hash)
		}

		let source = process.env.LOCAL_SERVER_DIRECTORY + '/' + ds_hash

		//const file_type = await FileType.fromFile(source)
		
		//Read the newly downloaded file and write to response
		const file_data = await new Promise((resolve, reject) => {
			fs.readFile(source, (err, data) => {
				if (err) {
					console.log('Error reading file: ' + err.toString())
				}
				resolve(data)
			})
		})

		//Verify the recieved hash matches the hash of the received data
		if (!verifyHash(file_data, ds_hash)) {
			console.log('Unreliable file')
			response.write('Error: file data does not match hash')
			response.end()
	
		}	else {
			//let file_type = await FileType.fromBuffer(file_data)
			let file_type = mime.lookup(source)
			console.log('file_type', file_type)
			response.writeHead(200, { 'Content-Type': 'text/html' })
			response.write(file_data, (err) => {
				response.end()
			})
		}
	}
}

async function verifyHash(file_data, ds_hash) {

		const hash = crypto.createHash('sha256')
		hash.update(file_data)
		const file_hash = await hash.digest('hex')
		
		return file_hash === ds_hash
}


module.exports = Gateway
