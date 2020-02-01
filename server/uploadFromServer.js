require('dotenv').config()
const crypto = require('crypto')
const http = require('http')
const path = require('path')
const fs = require('fs')
const formidable = require('formidable')
const query = require('../query.js')
const bt = require('buffer-type')

async function uploadFromServer(req, res) {

	//Get path to uploaded file	
	let source = await new Promise((resolve, reject) => {
		new formidable.IncomingForm().parse(req, (err, fields, files) => {
			resolve(files.file_data.path)
		})
	})
	
	//Get data of uploaded file
	const file_data = await new Promise((resolve, reject) => {
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

	let fspath = file_hash

	let url = '/renter/upload' + '?source=' + source + '&fspath=' + fspath + '&local=' + process.env.LOCAL_FILESYSTEM
	let method = 'POST'	
	let body = file_data

	query(url, method, body)

	res.writeHead(200, { 'Content-Type' : 'text/html' })
	res.write('<h3> Put the following hash in the DS record for the domain: ' + file_hash + '</h3> <input type="button" value="Upload more files" onclick="history.back(-1)" />')
	res.end()

}


module.exports = uploadFromServer
