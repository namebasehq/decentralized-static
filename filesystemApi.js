require('dotenv').config()
const query = require('./query')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

async function download (fspath, destination) {
  const url = '/renter/download' + '?fspath=' + fspath + '&destination=' + destination + '&local=' + process.env.LOCAL_FILESYSTEM
  const method = 'GET'

  const fileData = await query(url, method)

  await fs.mkdir(path.dirname(destination), { recursive: true }, function () {})
  await fs.writeFile(destination, fileData, err => {
    if (err) {
      console.log('Error writing file: ' + err.toString())
    }
  })
}

async function upload (source, fspath) {
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

  const url = '/renter/upload' + '?source=' + source + '&fspath=' + fspath + '&local=' + process.env.LOCAL_FILESYSTEM
  const method = 'POST'
  const body = fileData

  const res = query(url, method, body)
}

module.exports.download = download
module.exports.upload = upload
