const upload = require('./upload.js')

function download () {
  chrome.tabs.executeScript(null, {
    file: 'getPagesSource.js'
  }, function () {
    if (chrome.runtime.lastError) {
      message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message
    }
  })
}

function saveOptions () {
  var address = document.getElementById('address').value
  var port = document.getElementById('port').value
  chrome.storage.sync.set({
    address: address,
    port: port
  }, function () {})

  document.getElementById('uploadPage').style.display = ''
  document.getElementById('settings').style.display = 'none'
}

function restoreOptions () {
  chrome.storage.sync.get({
    address: '35.167.214.162',
    port: 5300
  }, function (items) {
    document.getElementById('address').value = items.address
    document.getElementById('port').value = items.port
  })
}

function settings () {
  document.getElementById('uploadPage').style.display = 'none'
  document.getElementById('settings').style.display = ''
}

document.getElementById('upload').addEventListener('click', download)
document.addEventListener('DOMContentLoaded', restoreOptions)
document.getElementById('save').addEventListener('click', saveOptions)
document.getElementById('settingsButton').addEventListener('click', settings)

chrome.extension.onMessage.addListener(async function (request, sender, callback) {
  if (request.action === 'upload') {
    var result = await new Promise((resolve, reject) => {
      chrome.storage.sync.get({
        address: '35.167.214.162',
        port: 5300
      }, function (items) {
        resolve(items)
      })
    })

    const setAddress = result.address
    const setPort = result.port
    const fileData = request.data

    await upload(setAddress, setPort, fileData, uploadPage)
  }
})
