import passport from 'koa-passport';
import compose from 'koa-compose';
import jwt from 'jsonwebtoken';
import {
	auth as config
} from './config';

import {
    knex
} from '../db/pg';

import humps from 'humps';

import {User} from '../models';

// Strategies
import jwtStrategy from './strategies/jwt';
import emailStrategy from './strategies/email';

passport.use('jwt', jwtStrategy);
passport.use('email', emailStrategy);

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	(function*() {
		try {
			const user = yield User.findById(id);
			done(null, user);
		} catch (error) {
			done(error);
		}
	})();
});

export default function auth() {
	return compose([
		passport.initialize(),
	]);
}

export function isAuthenticated() {
	return passport.authenticate('jwt');
}

export function authEmail() {
	return passport.authenticate('email');
}

// After autentication using one of the strategies, generate a JWT token
export function generateToken() {
	return function*() {
		const {
			user
		} = this.passport;
		if (user === false) {
			this.status = 401;
		} else {
			const _token = jwt.sign({
				id: user
			}, config.secret);
			const token = `JWT ${_token}`;
			
			const currentUser = yield User.findOne({
				where: {
					id: user
				}
			});

			console.log(currentUser);

			this.status = 200;
			this.body = {
				token,
				user: currentUser,
			};
		}
	};
}

// Web Facebook Authentication
export function isFacebookAuthenticated() {
	return passport.authenticate('facebook', {
		scope: ['email'],
	});
}

export function isFacebookAuthenticatedCallback() {
	return passport.authenticate('facebook', {
		failureRedirect: '/login',
	});
}