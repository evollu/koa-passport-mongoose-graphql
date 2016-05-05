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

const writeStream = function*(file, filename) {
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
		.get('/user/me', isAuthenticated(), function*() {
			const user = yield User.findById(this.passport.user);
			if (user) {
				this.body = user;
			}
		})
		.post('/user/contacts', isAuthenticated(), function*() {
			let invalid = validate(this.request.body, contactConstaints);
			if (invalid) {
				this.body = invalid;
				this.status = 400;
				return;
			}
			let {
				name,
				email
			} = this.request.body;
			const user = yield User.findById(this.passport.user);
			if (!user) {
				this.status = 400;
				return;
			}
			user.contacts.push({
				name,
				email
			});
			yield user.save();
			this.status = 201;
		})
		.put('/user/contacts/:id', isAuthenticated(), function*() {
			let invalid = validate(this.request.body, contactConstaints);
			if (invalid) {
				this.body = invalid;
				this.status = 400;
				return;
			}

			const user = yield User.findById(this.passport.user);
			let {
				name,
				email
			} = this.request.body;
			let contact = user.contacts.id(this.params.id);
			contact.name = name;
			contact.email = email;
			yield user.save();
			this.status = 200;

		})
		.delete('/user/contacts/:id', isAuthenticated(), function*() {
			const user = yield User.findById(this.passport.user);
			user.contacts.pull(this.params.id);
			yield user.save();
			this.status = 200;
		})
		.get('/user/profile', isAuthenticated(), function*() {
			const user = yield User.findById(this.passport.user);
			if (!user.profile) {
				this.status = 404;
				return;
			}
			let filepath = PROFILE_FOLDER_PREFIX + user.profile;
			let fstat = yield fs.statAsync(filepath);
			if (fstat.isFile()) {
				this.body = fs.createReadStream(filepath);
				this.type = path.extname(filepath);
			} else {
				this.status = 404;
			}

		})
		.post('/user/profile', isAuthenticated(), function*() {
			const user = yield User.findById(this.passport.user);
			let {
				files
			} = yield asyncBusboy(this.req);

			if (!files.length) {
				this.status = 400;
				this.body = 'invalid file type';
				return;
			}

			let file = files[0];
			let filename = uuid.v4() + path.extname(file.filename);
			yield writeStream(file, PROFILE_FOLDER_PREFIX + filename);
			user.profile = filename;
			yield user.save();
			this.body = {
				file: filename
			};

		});
};