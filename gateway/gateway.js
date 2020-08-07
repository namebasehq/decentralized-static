const path = require('path');
require('dotenv').config({ path: path.resolve('./.env') });
const fs = require('fs');
const http = require('http');
const crypto = require('crypto');
const skynet = require('@nebulous/skynet');
const HandshakeResolver = require('./hsResolver.js');
const DnsResolver = require('./dnsResolver.js');
const LRUcache = require('./fileLruCache.js');

var resolver;
var fileCache = new LRUcache(process.env.CACHE_SIZE);

class Gateway {
  constructor() {
    console.log('Constructing gateway');
    resolver = new HandshakeResolver();

    //this.uploadServer = new UploadServer(process.env.UPLOAD_SERVER_PORT);
    this.host = process.env.LOCAL_GATEWAY === 'true' ? '127.53.53.53' : '0.0.0.0';
    this.port = '80';

    this.httpServer = http.createServer();
    this.httpServer.on('request', this.handleHttpRequest);
    this.httpServer.on('listening', () => console.log('Gateway server listening on', `${this.host}:${this.port}`));

    this.dnsServer = new DnsResolver(resolver);
  }

  async open() {
    this.httpServer.listen(this.port, this.host);
    this.dnsServer.open();
  }

  async handleHttpRequest(req, res) {
    const domainName = req.headers.host;
    const destination = `${process.env.LOCAL_SERVER_DIRECTORY}/${domainName}.html`;
    console.log('Request for', domainName);

    let skylink;
    const cache = !!process.env.CACHE_SIZE ? fileCache.has(domainName) : null;
    if (!cache) {
      const txt = await resolver.getTXT(domainName);
      skylink = txt.split('=')[1];

      await skynet.DownloadFile(
        destination,
        skylink,
        skynet.DefaultDownloadOptions
      );

      if (!!process.env.CACHE_SIZE) fileCache.set(domainName, skylink);
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

    res.write(fileData, (err) => {
      res.end();
    });
  }
}

module.exports = Gateway
