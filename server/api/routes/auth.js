import {
    authEmail,
    generateToken,
} from '../../auth';

import {
    User,
    Contact
} from '../../models';

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
        gcm
    } = this.request.body;

    // TODO - improve validatiod
    let result = yield User.count({
        where: {
            email
        }
    });

    if (result === 0) {

        let newUser = {
            email,
            password,
            gcm,
            firstName,
            lastName,
            measures: [{
                type: 'weight',
                'frequency': 'daily',
                'time': new Date(29701000),
                'target': 170
            }, {
                type: 'bloodSugar',
                'frequency': 'weekly',
                'time': new Date(29701000),
                'target': 100
            }, {
                type: 'behavioralSurvey',
                'frequency': 'monthly',
                'time': new Date(29701000),
            }],
            notify: {
                'schedule': 2,
                'message': 15
            },
            tasks: [{
                type: 'weight',
                'time': new Date(29701000)
            }, {
                type: 'bloodSugar',
                'time': new Date(54901000)
            }],
            contacts: [{
                firstName: 'Gregory',
                lastName: 'House',
                email: 'dummy@adf.com',
                type: 'Physician',
                photo: 'http://ia.media-imdb.com/images/M/MV5BMTM0Mjc2NzI5OF5BMl5BanBnXkFtZTYwMDk4NzE3._V1_SX640_SY720_.jpg',
                canChat: true,
                readOnly: true
            }, {
                firstName: 'Allison',
                lastName: 'Cameron',
                email: 'dummy@adf.com',
                phone: '1234567890',
                type: 'CareManager',
                photo: 'http://vignette1.wikia.nocookie.net/house/images/5/5c/AllisonCameron.png/revision/latest?cb=20070812160453',
                canChat: true,
                readOnly: true
            }, {
                firstName: 'Remy',
                lastName: 'Hadley',
                email: 'dummy@adf.com',
                phone: '1234567890',
                type: 'Spouse',
                photo: 'http://vignette3.wikia.nocookie.net/house/images/d/d7/House_Thirteen.jpg/revision/latest?cb=20110506132114',
                canChat: false
            }]
        };

        let created;
        try {
            created = yield User.create(newUser, {
                returnning: true,
                include: [{
                  model: Contact,
                  as: 'contacts'
                }]
            });
        } catch (e) {
            this.throw(500, e);
        }

        this.passport = {
            user: created.dataValues.id,
        };

        yield next;

    } else {
        this.throw(400, 'E-mail already registered');
    }
}