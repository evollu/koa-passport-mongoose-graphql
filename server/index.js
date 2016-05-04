import Koa from 'koa';

import middleware from './middleware';
import auth from './auth';
import api from './api';

const app = new Koa();
app.keys = ['my-secret-key'];

app.use(function *(next) {
	try {
		yield next;
	} catch (err) {
		this.status = 500;
		this.body = err.message;
	}
});
app.use(middleware());
app.use(auth());
app.use(api());
app.use(function *() {
	this.status = 404;
});

export default app;