var express = require('express')
var bodyParser = require('body-parser')

class UploadServer {
  constructor (port) {
    this.port = port

    this.app = express()

    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({ extended: true }))

    this.routes = require('./routes.js')(this.app)
  }

  open () {
    this.server = this.app.listen(this.port, () => {
      console.log('UploadServer listening on port %s', this.server.address().port)
    })
  }
}

module.exports = UploadServer
