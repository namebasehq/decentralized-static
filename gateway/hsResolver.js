const path = require('path');
require('dotenv').config({ path: path.resolve('./.env') });
const dns = require('native-dns');

class HandshakeResolver {
  constructor() {
    this.server = { address: process.env.NAMEBASE_NAMESERVER, port: 53, type: 'udp' };
    this.timeout = 1000;
  }

  async getDS(name) {
    const domains = name.split('.');
    const rootName = domains[domains.length - 1];
    const record = await this.resolve(rootName, 'DS');
    return this.toDS(record);
  }

  async getTXT(name) {
    const record = await this.resolve(name, 'TXT');
    return await this.toTXT(record);
  }

  async getA(name) {
    return await this.resolve(name, 'A');
  }

  toDS(record) {
    const res = Buffer.from(record.answer[0].data.buffer.toJSON().data).toString('hex');
    return res.slice(res.length - 64);
  }

  toTXT(record) {
    return record.answer[0].data[0];
  }

  async resolve(name, type) {
    try {
      var question = dns.Question({
        name: name,
        type: type
      });

      var req = dns.Request({
        question: question,
        server: this.server,
        timeout: this.timeout
      });

      return new Promise((resolve, reject) => {
        req.on('message', (err, answer) => {
          resolve(answer);
        });

        req.send();
      })
    } catch (e) {
      console.log('Error resolving ' + name + ': ' + e.toString());
    }
  }
}

module.exports = HandshakeResolver
