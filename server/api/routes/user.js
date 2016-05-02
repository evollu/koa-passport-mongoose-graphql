import User from '../../models/User';
import {
	isAuthenticated
} from '../../auth';

export default (router) => {
	router
		.get('/user/me', isAuthenticated(), async ctx => {
			const user = await User.findById(ctx.passport.user);
			if (user) {
				ctx.body = user;
			}
		})
		.post('/user/contacts', isAuthenticated(), async ctx => {
			let {
				name,
				email
			} = ctx.request.body;
			const user = await User.findById(ctx.passport.user);
			if (!user) {
				ctx.status = 400;
				return;
			}
			user.contacts.push({
				name,
				email
			});
			try {
				await user.save();
				ctx.status = 200;
			} catch (e) {
				ctx.status = 400;
				ctx.body = e;
			}

		})
		.put('/user/contacts/:id', isAuthenticated(), async ctx => {
			const user = await User.findById(ctx.passport.user);
			if (!user) {
				ctx.status = 400;
				return;
			}
			let {
				name,
				email
			} = ctx.request.body;
            let contact = user.contacts.id(ctx.params.id);
            contact.name = name;
            contact.email = email;
			try {
				await user.save();
				ctx.status = 200;
			} catch (e) {
				ctx.status = 400;
				ctx.body = e;
			}

		})
		.delete('/user/contacts/:id', isAuthenticated(), async ctx => {
			const user = await User.findById(ctx.passport.user);
			if (!user) {
				ctx.status = 400;
				return;
			}
			user.contacts.pull(ctx.params.id);
			try {
				await user.save();
				ctx.status = 200;
			} catch (e) {
				ctx.status = 400;
				ctx.body = e;
			}
		});
};