const dns = require('native-dns')

class HandshakeResolver {
  constructor () {
    this.server = { address: '127.0.0.53', port: 53, type: 'udp' }
    this.timeout = 1000
  }

  async getDS (name) {
    const domains = name.split('.')
    const rootName = domains[domains.length - 1]
    const record = await this.resolve(rootName, 'DS')
    const ds = this.toDS(record)
    return ds
  }

  async resolve (name, type) {
    try {
      var question = dns.Question({
        name: name,
        type: type
      })

      var req = dns.Request({
        question: question,
        server: this.server,
        timeout: this.timeout
      })

      return new Promise((resolve, reject) => {
        req.on('message', (err, answer) => {
          resolve(answer)
        })

        req.send()
      })
    } catch (e) {
      console.log('Error resolving ' + name + ': ' + e.toString())
    }
  }

  toDS (record) {
    const res = Buffer.from(record.answer[0].data.buffer.toJSON().data).toString('hex')
    return res.slice(res.length - 64)
  }
}

module.exports.HandshakeResolver = HandshakeResolver
