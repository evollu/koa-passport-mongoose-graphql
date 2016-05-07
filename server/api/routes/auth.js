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
		name,
		email,
		password,
	} = this.request.body;

	// TODO - improve validation
	if (name && email && password) {
		let user = yield User.findOne({
			email,
		});

		if (!user) {
			user = new User({
				name,
				email,
				password
			});

			// TODO handle password

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