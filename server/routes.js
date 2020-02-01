const upload = require('./uploadFromServer.js')


var routes = function(app) {

  app.get("/", function(req, res) {
    res.sendFile(__dirname + '/index.html')
  })

  app.post("/upload", upload); 
}


module.exports = routes
