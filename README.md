# Environment variables

`SIA_DAEMON` - boolean if the built-in Sia daemon should be launched

`LOCAL_FILESYSTEM` - true if filesystem is on the same machine as the gateway

`FILESYSTEM_ADDRESS` - ip address of filesystem; must be ‘127.0.0.1’ if `LOCAL_FILESYSTEM`=true

`FILESYSTEM_PORT` - port the filesystem is listening to

`FILESYSTEM_API` - absolute or relative path to the Nodejs file where the custom filesystem api is stored

`LOCAL_SERVER_DIRECTORY` - local directory where all files downloaded from the filesystem will be stored

`UPLOAD_SERVER_PORT` - the gateway launches a simple webpage to enable file uploads to the filesystem; this defines which local port it listens on

`MAX_LOCALLY_STORED_SITES` - the number of webpages you would like stored locally in cache to reduce time spent downloading frequently viewed sites

# Where things are

Gateway - 127.53.53.53:80

Upload Server - website hosted on [GATEWAY IP]:`UPLOAD_SERVER_PORT`

HSD DNS Recursive Resolver - 127.0.0.1:25350

The AWS Image comes pre-equipped with a Sia Daemon, gateway, and full-node that can receive requests from any browser and serve content

However, this can be modified to disable the Sia Daemon and point to another node’s daemon or a different personal filesystem running either remotely or locally


# Setting up your own Sia+Gateway AWS Image

## Set up AWS Image with built-in Sia Daemon 

Set `LOCAL_SERVER_DIRECTORY`, `UPLOAD_SERVER_PORT` and `MAX_LOCALLY_STORED_SITES` and leave the rest of the default values

Run `main.js`

If Sia is previously unsetup, it will take the time to create and sync a wallet. The console will print ‘Wallet unlocked’ when this process is done. You can double check by running `siac wallet` and checking the value of “rescanning” and “unlocked”. Make note of a few important strings:

-Wallet Seed - the encryption password for your wallet, it will be stored in a file called `seed`

-Wallet Address - the address used to send money to your wallet, it will be stored in a file called `address`

Sia operates by negotiating contracts with hosts according to ‘allowances’ of how much money you would like to allocate to uploading/downloading/storing during a set period. After the wallet is synced, you must send coin to the wallet for the daemon launch to continue.

Once you put money in your wallet, the script will set the allowance with default values, if you would like to set these values yourself, run `siac renter setAllowance` (keep in mind that setting more restrictive settings may make it more difficult to generate contracts). The daemon will now start to generate contracts (should take about 40 minutes). The console will read ‘Upload ready’ when it is complete. You can double check this by running `siac renter uploadready` and checking the value of “ready”. 

You are now ready to upload content!

## Set up AWS Image with outside filesystem

Leave `HANDSHAKE_GATEWAY` as default and set the rest of the variables according to preference. Keep in mind, assigning a remote address to `FILESYSTEM_ADDRESS` while keeping `LOCAL_FILESYSTEM` as true will cause the gateway to not work. (If you would like to use our Sia Daemon, use the following settings:)

-`SIA_DAEMON` = false

-`LOCAL_FILESYSTEM`=false

-`FILESYSTEM_ADDRESS`=35.167.214.162

-`FILESYSTEM_PORT`=5300

Run `main.js` to start the gateway and the full-node

If you are using a filesystem other than the built-in daemon or our daemon, be sure you meet the specifications of the filesystem api explained here.

You are now ready to upload content!


# How to upload content

## Save open website (chrome-extension)

Open the website you want to save to your domain

Click the chrome extension and double check the settings to ensure the address and port match that of the gateway you want to upload to

Copy the hash that gets returned and set the DNS settings of your domain as follows:

>[DOMAIN] IN A [GATEWAY IP]

>[DOMAIN] IN DS 0000 8 2 [HASH]


## Upload local content

Open the upload server hosted on [GATEWAY IP]:`UPLOAD_SERVER_PORT`

Choose the file you want to upload and click ‘submit’

Copy the hash that gets returned and set the DNS settings of your domain as follows:

>[DOMAIN] IN A [GATEWAY IP]

>[DOMAIN] IN DS 0000 8 2 [HASH]


# Plug-in filesystem API

## Receive HTTP requests from gateway

If you would like to plug-in a filesystem that receives http requests from the gateway, it must be able to handle the following requests:


>url: '/renter/download?fspath=[]&destination=[]&local=[]'

>method: ‘GET’

Downloads the content from the filesystem addressed at `fspath` and saves it at some `destination` locally; if `local` is false, your filesystem should be able to read the downloaded file and write it to the `response` to transfer the file to the gateway machine

`fspath` - absolute path; where on the filesystem the content is stored

`destination` - absolute path; where the file should be saved locally

`local` - boolean; true if the filesystem and the gateway are on the same machine


>url: '/renter/upload?source=[]&fspath=[]&local=[]'

>method: 'POST'

Uploads the content from the local path `source` and saves it on the filesystem at some address `fspath`; if `local` is false, your filesystem should be able to read the uploaded file from the `request` and write it to the `source` path to transfer the file to the filesystem machine

`source` - absolute path; where the file should be saved

`fspath` - absolute path; where on the filesystem the content is stored

`local` - boolean; true if the filesystem and the gateway are on the same machine

### How to set up?

Set `FILESYSTEM_ADDRESS`and `FILESYSTEM_PORT` to the address where the http query will be received

If the address is local, set `LOCAL_FILESYSTEM`=true.


## Receive function calls from gateway (gateway and filesystem must be on the same system)

If you would like to plug-in a filesystem that receives function calls from the gateway, the api must be able to handle the following calls:


>`fsapi.download(fspath, destination)`

Downloads the content from the filesystem addressed at `fspath` and saves it at some `destination` locally

`fspath` - absolute path; where on the filesystem the content is stored

`destination` - absolute path; where the file should be saved locally

>`fsapi.upload(source, fspath)`

Uploads the content from the local path `source` and saves it on the filesystem at some address `fspath`

‘source’ - absolute path; where the file should be saved

‘fspath’ - absolute path; where on the filesystem the content is stored

### How to set up?

Set `FILESYSTEM_API` to the relative or absolute path to the Nodejs file that contains your filesystem’s api.
