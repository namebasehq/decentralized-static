const crypto = require('crypto')
const http = require('http')

async function uploadFileFromPopup (address, port, body, message) {
  const hash = crypto.createHash('sha256')
  hash.update(body)
  const fileHash = await hash.digest('hex')

  const source = '/' + fileHash
  const fsPath = fileHash

  const url = '/renter/upload' + '?source=' + source + '&fspath=' + fsPath + '&local=' + false

  const options = {
    hostname: address,
    port: port,
    path: url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  }

  message.innerText = 'Put the following hash in the DS record for domain : ' + fileHash

  const req = http.request(options)

  req.write(body)

  req.end()

  return fileHash
}

module.exports = uploadFileFromPopup
