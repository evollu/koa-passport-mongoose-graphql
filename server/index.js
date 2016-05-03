import Koa from 'koa';

import middleware from './middleware';
import auth from './auth';
import api from './api';

const app = new Koa();
app.keys = ['my-secret-key'];

app.use(async(ctx, next) => {
	try {
		await next();
	} catch (err) {
		ctx.status = 500;
		ctx.body = err.message;
	}
});
app.use(middleware());
app.use(auth());
app.use(api());
app.use(ctx => {
	ctx.status = 404;
});

export default app;