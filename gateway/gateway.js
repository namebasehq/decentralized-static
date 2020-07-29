const path = require('path');
require('dotenv').config({ path: path.resolve('./.env') });
const fs = require('fs');
const http = require('http');
const crypto = require('crypto');
const skynet = require('@nebulous/skynet');
const HandshakeResolver = require('./hsResolver.js');
const LRUcache = require('./fileLruCache.js');
const UploadServer = require('../server/server.js');

var resolver;
var fileCache = new LRUcache(process.env.MAX_LOCALLY_STORED_SITES);

class Gateway {
  constructor() {
    console.log('Constructing gateway');
    resolver = new HandshakeResolver();

    //this.uploadServer = new UploadServer(process.env.UPLOAD_SERVER_PORT);

    this.httpServer = http.createServer();
    this.httpServer.on('request', this.handleHttpRequest);
    this.httpServer.on('listening', () => console.log('Gateway server listening on', '127.53.53.53:80'));
  }

  async open() {
    this.httpServer.listen('80', '127.53.53.53');

    //this.uploadServer.open();
  }

  async handleHttpRequest(req, res) {
    const domainName = req.headers.host;
    const destination = process.env.LOCAL_SERVER_DIRECTORY + '/dest' + '.html';
    console.log('Request for', domainName);

    let skylink;
    if (!fileCache.has(domainName)) {
      skylink = await resolver.getTXT(domainName);

      console.log('File not in cache');
      await skynet.DownloadFile(
        destination,
        skylink,
        skynet.DefaultDownloadOptions
      );

      fileCache.set(domainName, skylink);
    }

    // Read the newly downloaded file and write to response
    const fileData = await new Promise((resolve, reject) => {
      fs.readFile(destination, (err, data) => {
        if (err) {
          console.log('Error reading file: ' + err.toString());
        }
        resolve(data);
      });
    });

    // Verify the recieved hash matches the hash of the received data
    res.writeHead(200);
    res.write(fileData, (err) => {
      res.end();
    });
    /*
    if (!verifyHash(fileData, skylink)) {
      res.write('Error: file data does not match hash');
      res.end();
    } else {
    }
    */
  }
}

async function verifyHash(fileData, dsHash) {
  const hash = crypto.createHash('sha256');
  hash.update(fileData);
  const fileHash = await hash.digest('hex');

  return fileHash === dsHash;
}

module.exports = Gateway
