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
node ./namebaseApi.js METHOD SERVICE DOMAIN RECORD_DATA
```
where

METHOD = `get` (retrieving records) or `put` (adding/updating records)

SERVICE = which DNS settings you want to add, the three options are:
	`blockchain` - for Handshake records that are `DS`, `TXT`, or `NS`

	‘blockchain-advanced’ - Handshake accepts some additional record types, in order to send these create a Handshake resource record and send the hex as the RECORD_DATA (more documentation can be found here https://hsd-dev.org/guides/resource-records.html )

	‘nameserver’ - Namebase’s own nameservers which enables users to set ‘A’, ‘CNAME’, ‘ALIAS’, ‘NS’, ‘DS’, and ‘TXT’ records either on the root or a subdomain. All names won on Namebase should have this configured by default.


DOMAIN = your Handshake domain

RECORD_DATA = only necessary for METHOD=’put’; the json format varies slightly based on the SERVICE, be sure to double check with the full documentation


### Connecting Your App
You’ll need to set a `TXT` record with the skylink for your app. Here’s what the call should look like:
```
node namebaseApi.js put blockchain YOUR_DOMAIN ‘{ “records”: [{ “type”: “TXT”, “host”: “”, “value”: “skylink=[YOUR_SKYLINK]”, “ttl”: 0 }] }’
```

Keep in mind, that the blockchain endpoints will replace all existing records with the new json that is sent. So, if you only want to add another record, you have to get the current records and send them along with the new one. For deleting, you would need to resend all the current records except for the one you want to delete.

The nameserver records are slightly different. It will only replace records if a record with the same type and host is specified. For example, if I have a TXT record set on foo.example, adding another TXT record on bar.example will not replace it. 
