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
    this.host = process.env.LOCAL_GATEWAY ? '127.53.53.53' : '0.0.0.0';
    this.port = '80';

    this.httpServer = http.createServer();
    this.httpServer.on('request', this.handleHttpRequest);
    this.httpServer.on('listening', () => console.log('Gateway server listening on', `${this.host}:${this.port}`));
  }

  async open() {
    this.httpServer.listen(this.port, this.host);

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
  }
}

module.exports = Gateway
