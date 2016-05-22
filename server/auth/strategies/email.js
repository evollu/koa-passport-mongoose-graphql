import {
    Strategy as CustomStrategy
} from 'passport-custom';

import {User} from '../../models';

export default new CustomStrategy(async(ctx, done) => {
    console.log('Email Strategy: ', ctx.body);

    try {
        // Test whether is a login using email and password
        if (ctx.body.email && ctx.body.password) {
            const user = await User.findOne({
              email: ctx.body.email.toLowerCase().trim(),
              password: ctx.body.password
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
});