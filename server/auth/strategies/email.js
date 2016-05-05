import User from '../../models/User';
import co from 'co';
import {
    Strategy as CustomStrategy
} from 'passport-custom';

export default new CustomStrategy(co.wrap(function *(ctx, done) {
    console.log('Email Strategy: ', ctx.body);

    try {
        // Test whether is a login using email and password
        if (ctx.body.email && ctx.body.password) {
            const user = yield User.findOne({
                email: ctx.body.email.toLowerCase()
            });

            if (!user) {
                done(null, false);
            }

            done(null, user);
            // TODO - check password
        } else {
            done(null, false);
        }
    } catch (error) {
        done(error);
    }
}));