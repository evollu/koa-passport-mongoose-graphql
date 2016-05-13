import mongoose from 'mongoose';
import redis from './redis';

const databaseConfing = process.env.MONGODB_URI || 'mongodb://localhost/mydb';

export function connectDatabase() {
	return new Promise((resolve, reject) => {
		mongoose.connection
			.on('error', error => reject(error))
			.on('close', () => console.log('Database connection closed.'))
			.once('open', () => resolve(mongoose.connections[0]));

		mongoose.connect(databaseConfing);
	});
}

export function connectRedis() {
	return redis.connect(process.env.REDIS_URL || 'localhost:6379');
}