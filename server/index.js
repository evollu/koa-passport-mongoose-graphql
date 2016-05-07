import Koa from 'koa';

import logger from 'koa-logger';
import cors from 'koa-cors';
import bodyParser from 'koa-bodyparser';
import etag from 'koa-etag';
import auth from './auth';
import api from './api';

const app = new Koa();
app.keys = ['my-secret-key'];

import graffiti from '@risingstack/graffiti';
import { getSchema } from '@risingstack/graffiti-mongoose';
import Models from './models';

const schema = getSchema(Models, {
	hooks: {
		mutation: {
			pre: (next, args, context) => {
				console.log(context);
				next();
			}
		}
	}
});
const graphiql = true;

app.use(function *(next) {
	try {
		yield next;
	} catch (err) {
		this.status = 500;
		this.body = err.message;
	}
});
app.use(logger());
app.use(cors());
app.use(bodyParser());
app.use(auth());
app.use(graffiti.koa({
	schema,
	graphiql,
}));
app.use(etag());
app.use(api());
app.use(function *() {
	this.status = 404;
});

export default app;