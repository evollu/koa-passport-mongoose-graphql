import Redis from 'ioredis';

class redis{

	connect(options) {
		return new Promise((resolve, reject) => {
			this.options = options;
			this.connection = new Redis();

			this.connection.on('error', (error) => {
				reject(error);
			});

			this.connection.on('ready', () => {
				resolve();
			});

			this.connection.on('authError', (error) => {
				reject(error);
			});
		});

	}

	get(key) {
		return this.connection.get(key).then(JSON.parse);
	}

	getBuffer(key) {
		return this.connection.getBuffer(key);
	}

	has(key) {
		return this.connection.exists(key).then(check => check > 0);
	}

	set(key, value, timeout) {
		return this.connection.set(key, JSON.stringify(value), 'EX', timeout);
	}

}

export default new redis();