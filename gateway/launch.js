const Gateway = require('./gateway.js')

if (require.main === module) {
  const gateway = new Gateway()
  gateway.open()
}
