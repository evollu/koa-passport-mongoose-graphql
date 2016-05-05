import mongoose from 'mongoose';

import {
	development,
	production,
} from './config';

const databaseConfing = (process.env.NODE_ENV === 'production') ? production : development;

export default function connectDatabase() {
	return new Promise((resolve, reject) => {
		mongoose.connection
			.on('error', error => reject(error))
			.on('close', () => console.log('Database connection closed.'))
			.once('open', () => resolve(mongoose.connections[0]));

		mongoose.connect(databaseConfing);
	});
}