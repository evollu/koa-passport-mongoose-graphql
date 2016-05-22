import {
	Strategy as JWTStrategy,
	ExtractJwt
} from 'passport-jwt';
import {
	auth
} from '../config';

import {User} from '../../models';

const opts = {
	jwtFromRequest: ExtractJwt.fromAuthHeader(),
	secretOrKey: auth.secret,
};

export default new JWTStrategy(opts, async(jwt_payload, done) =>{
	const user = await User.findOne({
		where: {
			id: jwt_payload.id
		}
	});
	if (user) {
		done(null, user);
	} else {
		done(null, false);
	}
});