import User from '../../models/User';
import asyncBusboy from 'async-busboy';
import uuid from 'node-uuid';
import path from 'path';
import validate from 'validate.js';
import fs from 'fs';
import {
	isAuthenticated
} from '../../auth';

const PROFILE_FOLDER_PREFIX = 'upload/';

const writeStream = async(file, filename) => {
	return new Promise((resolve, reject) => {
		let stream = fs.createWriteStream(filename);
		stream.on('finish', (e) => {
			resolve();
		});
		stream.on('error', (e) => {
			reject(e);
		});
		file.pipe(stream);
	});

};

const contactConstaints = {
	name: { length: { maximum: 30 }, presence: true },
	email: { email: true, presence: true },
	phone: {
		format: {
			pattern: /^\d{9}$/,
			flags: 'i'
		}
	}
};

export default (router) => {
	router
		.get('/user/me', isAuthenticated(), async ctx => {
			const user = await User.findById(ctx.passport.user);
			if (user) {
				ctx.body = user;
			}
		})
		.post('/user/contacts', isAuthenticated(), async ctx => {
			let invalid = validate(ctx.request.body, contactConstaints);
			if (invalid) {
				ctx.body = invalid;
				ctx.status = 400;
				return;
			}
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
			await user.save();
			ctx.status = 201;
		})
		.put('/user/contacts/:id', isAuthenticated(), async ctx => {
			let invalid = validate(ctx.request.body, contactConstaints);
			if (invalid) {
				ctx.body = invalid;
				ctx.status = 400;
				return;
			}

			const user = await User.findById(ctx.passport.user);
			let {
				name,
				email
			} = ctx.request.body;
			let contact = user.contacts.id(ctx.params.id);
			contact.name = name;
			contact.email = email;
			await user.save();
			ctx.status = 200;

		})
		.delete('/user/contacts/:id', isAuthenticated(), async ctx => {
			const user = await User.findById(ctx.passport.user);
			user.contacts.pull(ctx.params.id);
			await user.save();
			ctx.status = 200;
		})
		.get('/user/profile', isAuthenticated(), async ctx => {
			const user = await User.findById(ctx.passport.user);
			if (!user.profile) {
				ctx.status = 404;
				return;
			}
			let filepath = PROFILE_FOLDER_PREFIX + user.profile;
			let fstat = await fs.statAsync(filepath);
			if (fstat.isFile()) {
				ctx.body = fs.createReadStream(filepath);
				ctx.type = path.extname(filepath);
			} else {
				ctx.status = 404;
			}

		})
		.post('/user/profile', isAuthenticated(), async ctx => {
			const user = await User.findById(ctx.passport.user);
			let {
				files
			} = await asyncBusboy(ctx.req);

			if (!files.length) {
				ctx.status = 400;
				ctx.body = 'invalid file type';
				return;
			}

			let file = files[0];
			let filename = uuid.v4() + path.extname(file.filename);
			await writeStream(file, PROFILE_FOLDER_PREFIX + filename);
			user.profile = filename;
			await user.save();
			ctx.body = {
				file: filename
			};

		});
};