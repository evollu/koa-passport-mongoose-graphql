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
		.delete('/user', isAuthenticated(), function*(next){
			yield this.passport.user.remove();
			this.body = 200;
		})
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
		.post('/user/measure', isAuthenticated(), function*() {
			console.log(this.request.body);
			this.passport.user.measures.push(this.request.body);
			try {
				let response = yield this.passport.user.save();
				this.status = 200;
				this.body = response.measures[response.measures.length - 1];
			} catch (e) {
				this.throw(400, e);
			}
		})
		.delete('/user/measure/:id', isAuthenticated(), function*() {
			this.passport.user.measures.pull(this.params.id);
			try {
				yield this.passport.user.save();
				this.status = 200;
			} catch (e) {
				this.throw(400, e);
			}
		})
		.post('/user/measure/data', isAuthenticated(), function*() {
			this.status = 200;
		})
		.post('/user/team', isAuthenticated(), function*() {
			let invalid = validate(this.request.body, contactConstaints);
			if (invalid) {
				this.throw(400, JSON.stringify(invalid));
			}
			let {
				name,
				email
			} = this.request.body;
			this.passport.user.team.push({
				name,
				email
			});
			yield this.passport.user.save();
			this.status = 201;
		})
		.put('/user/team/:id', isAuthenticated(), function*() {
			let invalid = validate(this.request.body, contactConstaints);
			if (invalid) {
				this.throw(400, JSON.stringify(invalid));
			}

			let {
				name,
				email
			} = this.request.body;
			let contact = this.passport.user.team.id(this.params.id);
			contact.name = name;
			contact.email = email;
			yield this.passport.user.save();
			this.status = 200;

		})
		.delete('/user/team/:id', isAuthenticated(), function*() {
			this.passport.user.team.pull(this.params.id);
			yield this.passport.user.save();
			this.status = 200;
		})
		.get('/user/profile', isAuthenticated(), function*() {
			if (!this.passport.user.profile) {
				this.throw(400);
			}
			let filepath = PROFILE_FOLDER_PREFIX + this.passport.user.profile;
			let fstat = yield fs.statAsync(filepath);
			if (fstat.isFile()) {
				this.body = fs.createReadStream(filepath);
				this.type = path.extname(filepath);
			} else {
				this.throw(404);
			}

		})
		.post('/user/profile', isAuthenticated(), function*() {
			let {
				files
			} = yield asyncBusboy(this.req);

			if (!files.length) {
				this.throw(400, 'Invalid file type');
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