const path = require('path');
require('dotenv').config({ path: path.resolve('./.env') });
const dns = require('native-dns');

let resolver;

class DnsResolver {
  constructor(hsResolver) {
    this.host = '127.53.53.53';
    this.port = '53';
  
    resolver = hsResolver;

    this.dnsServer = dns.createServer();
    this.dnsServer.on('request', this.handleDnsRequest);
  }

  async open() {
    this.dnsServer.serve(this.port, this.host);
  }

  handleDnsRequest(req, res) {
    const { name, type } = req.question[0];

    if (type === 1) {
      resolver.resolve(name, 'A').then(
        response => {
          const { answer } = response;

          if (answer.length > 0) {
            res.answer.push(answer[0]);
            res.send();
          } else {
            resolver.resolve(name, 'TXT').then(
              txtResponse => {
                const txtAnswer = txtResponse.answer;

                if (txtAnswer.length > 0) {
                  const [key, value] = txtAnswer[0].data[0].split('=');
                  if (key === 'skylink') {
                    res.answer.push(dns.A({
                      name,
                      address: '127.53.53.53',
                      ttl: 3600,
                    }));

                  }
                  res.send();
                }
              }
            );
          }
        }
      );
    } else {
      resolver.resolve(name, type).then(
        response => {
          const { answer } = response;
          if (answer.length > 0) {
            res.answer.push(answer[0]);
            res.send();
          }
        }
      );
    }
  }
}

module.exports = DnsResolver
