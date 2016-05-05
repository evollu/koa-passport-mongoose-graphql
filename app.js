import app from './server';
import co from 'co';
import { connectDatabase, connectRedis } from './server/db';

const port = process.env.PORT || 4000;

co(function*() {
	try {
		const info = yield connectDatabase();
		console.log(`Connected to ${info.host}:${info.port}/${info.name}`);
	} catch (error) {
		console.error('Unable to connect to database');
	}

	try {
		yield connectRedis();
		console.log('Connected to redis');
	} catch (e) {
		console.error(e);
	}

	yield app.listen(port);
	console.log(`Server started on port ${port}`);
});