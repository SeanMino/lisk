var client, logger, cacheEnabled, errorMessage = 'Cache Unavailable';

// Constructor
function Cache (cb, scope) {
	client = scope.cache.client;
	logger = scope.logger;
	cacheEnabled = scope.cache.cacheEnabled;
	setImmediate(cb, null, this);
}

Cache.prototype.onNewBlock = function (key, cb) {
	if (this.isConnected()) {
		this.flushDb(function (err) {
			if (err) {
				logger.error('Error clearing cache on new block');
			} else {
				logger.info('Cache cleared on new block');
			}
		});
	}
};

Cache.prototype.onFinishRound = function (key, cb) {
	if (this.isConnected()) {
		this.flushDb(function (err) {
			if (err) {
				logger.error('Error clearing cache on round finish');
			} else {
				logger.info('Cache cleared on new Round');
			}
		});
	}
};

Cache.prototype.getJsonForKey = function (key, cb) {
	// we can use config var to check if caching is activated
	if (this.isConnected()) {
		client.get(key, function (err, value) {
			// parsing string to json
			cb(err, JSON.parse(value));
		});
	} else {
		cb(errorMessage);
	}
};

Cache.prototype.setJsonForKey = function (key, value, cb) {
	if (this.isConnected()) {
		// redis calls toString on objects, which converts it to object [object] so calling stringify before saving
		client.set(key, JSON.stringify(value), cb);
	} else {
		cb(errorMessage);
	}
};

Cache.prototype.deleteJsonForKey = function (key, value, cb) {
	if (this.isConnected()) {
		client.del(key, cb);
	} else {
		cb(errorMessage);
	}
};

Cache.prototype.isConnected = function () {
	return cacheEnabled && client.connected;
};

Cache.prototype.flushDb = function (cb) {
	if (this.isConnected()) {
		client.flushdb(cb);
	} else {
		cb(errorMessage);
	}
};

module.exports = Cache;
