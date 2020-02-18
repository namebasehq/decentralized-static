const path = require('path')
require('dotenv').config({path: path.resolve('../.env')})
const query = require('./query.js')
const fs = require('fs')
const http = require('http')
const HandshakeResolver = require('./hsResolver.js').HandshakeResolver
const LRUcache = require('./fileLruCache.js')
const crypto = require('crypto')
const UploadServer = require('../server/server.js')

const filesystemApi = require(process.env.FILESYSTEM_API)
var resolver
var fileCache = new LRUcache(process.env.MAX_LOCALLY_STORED_SITES)

class Gateway {
  constructor () {
    console.log('Constructing gateway')
    resolver = new HandshakeResolver()

    this.uploadServer = new UploadServer(process.env.UPLOAD_SERVER_PORT)

    this.httpServer = http.createServer()
    this.httpServer.on('request', this.handleHttpRequest)
    this.httpServer.on('listening', () => console.log('Gateway server listening on', '127.53.53.53:53:80'))
  }

  async open () {
    this.httpServer.listen('80', '127.53.53.53')

    this.uploadServer.open()
  }

  async handleHttpRequest (req, res) {
    if (req) {
      console.log(req.url)
    }

    const domainName = req.headers.host
    console.log('Request for', domainName)

    // Retrieve the hash of the content from the DS record
    const dsHash = await resolver.getDS(domainName)

    // Check if content already exists in local directory
    if (!fileCache.has(domainName)) {
      console.log('File not in cache')
      await filesystemApi.download(dsHash, process.env.LOCAL_SERVER_DIRECTORY + '/' + dsHash)
      fileCache.set(domainName, dsHash)
    }

    const source = process.env.LOCAL_SERVER_DIRECTORY + '/' + dsHash

    // const file_type = await FileType.fromFile(source)

    // Read the newly downloaded file and write to response
    const fileData = await new Promise((resolve, reject) => {
      fs.readFile(source, (err, data) => {
        if (err) {
          console.log('Error reading file: ' + err.toString())
        }
        resolve(data)
      })
    })

    // Verify the recieved hash matches the hash of the received data
    if (!verifyHash(fileData, dsHash)) {
      console.log('Unreliable file')
      res.write('Error: file data does not match hash')
      res.end()
    } else {
      // let file_type = await FileType.fromBuffer(file_data)
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.write(fileData, (err) => {
        res.end()
      })
    }
  }
}

async function verifyHash (fileData, dsHash) {
  const hash = crypto.createHash('sha256')
  hash.update(fileData)
  const fileHash = await hash.digest('hex')

  return fileHash === dsHash
}

module.exports = Gateway
