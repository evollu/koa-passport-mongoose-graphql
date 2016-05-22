import Koa from 'koa';

import logger from 'koa-logger';
import cors from 'koa-cors';
import bodyParser from 'koa-bodyparser';
import etag from 'koa-etag';
import auth from './auth';
import api from './api';

const app = new Koa();
app.keys = ['my-secret-key'];


app.use(logger());
app.use(cors());
app.use(bodyParser());
app.use(auth());
app.use(etag());
app.use(api());
app.use(function*() {
	this.status = 404;
});

export default app;