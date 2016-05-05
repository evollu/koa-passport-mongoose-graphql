import compose from 'koa-compose';
import logger from 'koa-logger';
import cors from 'koa-cors';
import bodyParser from 'koa-bodyparser';
import etag from 'koa-etag';

export default function middleware() {
	return compose([
		logger(),
		cors(),
		bodyParser(),
		etag(),
	]);
}