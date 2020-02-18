require('dotenv').config()
const crypto = require('crypto')
const fs = require('fs')
const formidable = require('formidable')
const query = require('../query.js')

async function uploadFromServer (req, res) {
  // Get path to uploaded file
  const source = await new Promise((resolve, reject) => {
    new formidable.IncomingForm().parse(req, (err, fields, files) => {
      if (err) {
        console.log(err)
      }
      resolve(files.fileData.path)
    })
  })

  // Get data of uploaded file
  const fileData = await new Promise((resolve, reject) => {
    fs.readFile(source, (err, data) => {
      if (err) {
        console.log('Error reading file ' + source + ': ' + err.toString())
      }
      resolve(data)
    })
  })

  const hash = crypto.createHash('sha256')
  hash.update(fileData)
  const fileHash = hash.digest('hex')

  const fspath = fileHash

  const url = '/renter/upload' + '?source=' + source + '&fspath=' + fspath + '&local=' + process.env.LOCAL_FILESYSTEM
  const method = 'POST'
  const body = fileData

  query(url, method, body)

  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.write('<h3> Put the following hash in the DS record for the domain: ' + fileHash + '</h3> <input type="button" value="Upload more files" onclick="history.back(-1)" />')
  res.end()
}

module.exports = uploadFromServer
