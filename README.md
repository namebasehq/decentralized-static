# Environment variables

`LOCAL_GATEWAY` - true if the gateway is only being use by you and does not need to be opened to the internet

`LOCAL_SERVER_DIRECTORY` - the website content will be downloaded before being displayed to your browser, this directory will store all of the downloaded files


`HNS_NAMESERVER_HOST` - address of Handshake resolver

`HNS_NAMESERVER_PORT` - port of Handshake resolver


`CACHE` - the number of webpages you would like stored locally in cache to reduce time spent downloading frequently viewed sites

# Where things are

Gateway - `127.53.53.53:80`

DNS Resolver - `127.53.53.53:53`

# Creating a blog hosted by Sia-Handshake

## Getting started

### Get Namebase API key

Login to your Namebase account and go to `https://namebase.io/pro/keys`.

Click ‘NEW API KEY’ in the top right.

Replace the `ACCESS_KEY` and `SECRET_KEY` variables in lines 3-4 of the script with the new keys.


Using the Script
Now that your script is authenticated, you can test out the queries. The script call looks like:
```
npm run get-settings SERVICE DOMAIN
npm run update-settings SERVICE DOMAIN RECORD_DATA
```
where

SERVICE = which DNS settings you want to add, the three options are:
	`blockchain` - for Handshake records that are `DS`, `TXT`, or `NS`

	`blockchain-advanced` - Handshake accepts some additional record types, in order to send these create a Handshake resource record and send the hex as the RECORD_DATA (more documentation can be found here https://hsd-dev.org/guides/resource-records.html )

	`nameserver` - Namebase’s own nameservers which enables users to set `A`, `CNAME`, `ALIAS`, `NS`, `DS`, and `TXT` records either on the root or a subdomain. All names won on Namebase should have this configured by default.


DOMAIN = your Handshake domain

RECORD_DATA = only necessary for METHOD=`put`; the json format varies slightly based on the SERVICE, be sure to double check with the full documentation


### Connecting Your App

#### Upload your file to Skynet
Run this curl command to upload your file to Skynet
```
curl -X POST "https://siasky.net/skynet/skyfile" -F file=@[FILE]
```

If it succeeds, you'll receive the skylink and merkle root to your file. You'll use the skylink in the next step.

#### Connecting your Skynet file to Handshake
You’ll need to set a `TXT` record with the skylink for your app. Here’s what the call should look like:
```
npm run update-settings blockchain YOUR_DOMAIN ‘{ “records”: [{ “type”: “TXT”, “host”: “@”, “value”: “skylink=[YOUR_SKYLINK]”, “ttl”: 0 }] }’
```

More information on the Namebase DNS Settings API can be found [here](https://github.com/namebasehq/api-documentation/blob/master/dns-settings-api.md).

Keep in mind that the blockchain endpoints will replace all existing records with the new json that is sent. So, if you only want to add another record, you have to get the current records and send them along with the new one. For deleting, you would need to resend all the current records except for the one you want to delete.

The nameserver records are slightly different. It will only replace records if a record with the same type and host is specified. For example, if I have a `TXT` record set on foo.example, adding another `TXT` record on bar.example will not replace it.

#### Setting up your Sia-Handshake Gateway
First set your environment variables.

Unless you want to open your resolver to the internet to allow other servers to resolve off of your gateway, leave `LOCAL_GATEWAY` as 'true'.

Make a directory to store the skynet content of the sites you visit. It will act as a cache and will only store as many sites as `CACHE` is set to. Set `LOCAL_SERVER_DIRECTORY` to the full path of this directory.

Finally, set `HNS_NAMESERVER_HOST` and `HNS_NAMESERVER_PORT` to the address and port of a Handshake resolver. NextDNS is recommended.


#### Running the gateway
In order to run the DNS resolver, you're going to need to take over port 53. If your system has a native resolver running on port 53, you need to stop it before running the gateway.

To start:
```
sudo npm run start
```
