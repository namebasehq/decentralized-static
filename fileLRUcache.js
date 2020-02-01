require('dotenv')
const process = require('process')
const LRU = require('lru-cache')
const fs = require('fs')

class fileCache {

	constructor(size) {
		this.cache = new LRU(size)
	}

	get(domain) {
		return this.cache.get(domain)
	}

	set(domain, path) {
		if (this.cache.itemCount === this.cache.length) {
			console.log('Last element', this.getLastElement())
			fs.unlink(process.env.LOCAL_SERVER_DIRECTORY + this.getLastElement, function(){})
		}

		this.cache.set(domain, path)
	}

	has(domain) {
		return this.cache.has(domain)
	}

	getLastElement() {
		console.log("All values", this.cache.values())
		return this.cache.values()[this.cache.length-1]
	}
}

module.exports = fileCache
