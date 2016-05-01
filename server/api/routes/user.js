import User from '../../models/User';
import {
    isAuthenticated
} from '../../auth';

export default (router) => {
    router
        .get('/user/me', isAuthenticated(), async ctx => {
            const user = await User.findById(ctx.passport.user);
            if (user) {
                ctx.body = user;
            }
        });
};