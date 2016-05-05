import mongoose from 'mongoose';
import redis from './redis';

import {
	development,
	production,
} from './config';

const databaseConfing = (process.env.NODE_ENV === 'production') ? production : development;

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
	return redis.connect({});
}