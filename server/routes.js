const path = require('path')
const upload = require('./uploadFromServer.js')

var routes = function (app) {
  app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/index.html'))
  })

  app.post('/upload', upload)
}

module.exports = routes
