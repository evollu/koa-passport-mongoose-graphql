import {
	authEmail,
	generateToken,
} from '../../auth';
import User from '../../models/User';

export default (router) => {
	router
		.post('/auth/email',
			authEmail(),
			generateToken());

	router
		.post('/auth/register',
			register,
			generateToken(),
		);
};

function* register(next) {
	const {
		firstName,
		lastName,
		email,
		password,
	} = this.request.body;

	// TODO - improve validation
	if (firstName && lastName && email && password) {
		let user = yield User.findOne({
			email,
		});

		if (!user) {
			user = new User({
				firstName,
				lastName,
				email,
				password
			});

			// TODO handle password

			//push dummy data
			user.measures = [{
				'type': 'weight',
				'frequency': 'daily',
				'time': new Date(29701000),
				'target': 170
			}];
			user.notify = {
				'task': 2,
				'chat': 15
			};
			user.tasks = [{
				'type': 'weight',
				'time': new Date(29701000)
			}, {
				'type': 'bloodSugar',
				'time': new Date(54901000)
			}];
			user.team = [{
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

			yield user.save();

			this.passport = {
				user: user._id,
			};

			yield next;

		} else {
			this.status = 400;
			this.body = {
				status: 'error',
				message: 'E-mail already registered'
			};
		}
	} else {
		this.status = 400;
		this.body = {
			status: 'error',
			message: 'Invalid email or password'
		};
	}
}