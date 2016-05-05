import User from '../../models/User';
import asyncBusboy from 'async-busboy';
import uuid from 'node-uuid';
import path from 'path';
import validate from 'validate.js';
import fs from 'fs';
import {
	isAuthenticated
} from '../../auth';
import redis from '../../db/redis';

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
		.get('/user/me', isAuthenticated(), function*(next) {
			let key = this.passport.user._id + ':' + this.request.url;
			if (yield redis.has(key)) {
				console.log('serve cache ' + key);
				this.body = yield redis.get(key);
			} else {
				console.log('no cache found');
				yield next;
				console.log('write cache ' + key);
				redis.set(key, this.body, 10);
			}
		}, function*() {
			this.body = this.passport.user;
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
			if (!this.passport.user) {
				this.status = 400;
				return;
			}
			this.passport.user.contacts.push({
				name,
				email
			});
			yield this.passport.user.save();
			this.status = 201;
		})
		.put('/user/contacts/:id', isAuthenticated(), function*() {
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
			let contact = this.passport.user.contacts.id(this.params.id);
			contact.name = name;
			contact.email = email;
			yield this.passport.user.save();
			this.status = 200;

		})
		.delete('/user/contacts/:id', isAuthenticated(), function*() {
			this.passport.user.contacts.pull(this.params.id);
			yield this.passport.user.save();
			this.status = 200;
		})
		.get('/user/profile', isAuthenticated(), function*() {
			if (!this.passport.user.profile) {
				this.status = 404;
				return;
			}
			let filepath = PROFILE_FOLDER_PREFIX + this.passport.user.profile;
			let fstat = yield fs.statAsync(filepath);
			if (fstat.isFile()) {
				this.body = fs.createReadStream(filepath);
				this.type = path.extname(filepath);
			} else {
				this.status = 404;
			}

		})
		.post('/user/profile', isAuthenticated(), function*() {
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
			this.passport.user.profile = filename;
			yield this.passport.user.save();
			this.body = {
				file: filename
			};

		});
};