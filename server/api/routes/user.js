import asyncBusboy from 'async-busboy';
import uuid from 'node-uuid';
import path from 'path';
import validate from 'validate.js';
import fs from 'fs';
import {
	isAuthenticated
} from '../../auth';
import redis from '../../db/redis';
import fetch from 'node-fetch';

const GCM_URL = 'https://gcm-http.googleapis.com/gcm/send';
const GCM_AUTH = 'key=AIzaSyAq-ia0b-MicHcSr4v_4CwLjFLAGMGPO8Y';

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
		.post('/user/gcm', isAuthenticated(), function*() {
			if (!this.request.body.gcm) {
				this.throw(400, 'empty gcm');
			}
			console.log(this.request.body.gcm);
			this.passport.user.gcm = this.request.body.gcm;
			yield this.passport.user.save();
			this.status = 201;
		})
		.post('/user/reset', isAuthenticated(), function*(next) {
			//push dummy data
			this.passport.user.measures = [{
				'type': 'weight',
				'frequency': 'daily',
				'time': new Date(29701000),
				'target': 170
			}];
			this.passport.user.notify = {
				'task': 2,
				'chat': 15
			};
			this.passport.user.tasks = [{
				'type': 'weight',
				'time': new Date(29701000)
			}, {
				'type': 'bloodSugar',
				'time': new Date(54901000)
			}];
			this.passport.user.team = [{
				'name': 'Gregory House',
				'email': 'dummy@adf.com',
				'type': 'Physician',
				'photo': 'http://ia.media-imdb.com/images/M/MV5BMTM0Mjc2NzI5OF5BMl5BanBnXkFtZTYwMDk4NzE3._V1_SX640_SY720_.jpg',
				'canChat': true
			}, {
				'name': 'Allison Cameron',
				'email': 'dummy@adf.com',
				'phone': '1234567890',
				'type': 'CareManager',
				'photo': 'http://vignette1.wikia.nocookie.net/house/images/5/5c/AllisonCameron.png/revision/latest?cb=20070812160453',
				'canChat': true
			}, {
				'name': 'Remy Hadley',
				'email': 'dummy@adf.com',
				'phone': '1234567890',
				'type': 'Spouse',
				'photo': 'http://vignette3.wikia.nocookie.net/house/images/d/d7/House_Thirteen.jpg/revision/latest?cb=20110506132114',
				'canChat': false
			}];
			yield this.passport.user.save();
			this.body = this.passport.user;
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
			this.status = 201;
			this.body = {
				_id: 'fakeid',
				...this.request.body
			};
		})
		.put('/user/measure/data/:id', isAuthenticated(), function*() {
			this.status = 200;
		})
		.post('/user/team', isAuthenticated(), function*() {
			let {
				name,
				email,
				type,
				photo,
				phone
			} = this.request.body;
			this.passport.user.team.push({
				name,
				email,
				type,
				photo,
				phone
			});
			try {
				yield this.passport.user.save();
				let result = yield fetch(GCM_URL, {
					method: 'POST',
					headers: {
						Authorization: GCM_AUTH,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						to: this.passport.user.gcm,
						data: {
							type: 'NEW_CONTACT',
							data: this.passport.user.team[this.passport.user.team.length - 1]
						}
					})
				});
				if (!result.ok) {
					console.log(yield result.text());
				}
				this.status = 201;

			} catch (e) {
				console.log(e);
				this.throw(500, e);
			}

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