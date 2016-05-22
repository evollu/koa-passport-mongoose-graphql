// import asyncBusboy from 'async-busboy';
// import uuid from 'node-uuid';
// import path from 'path';
// import validate from 'validate.js';
//import fs from 'fs';
import {
    isAuthenticated
} from '../../auth';
import fetch from 'node-fetch';

import {
    knex
} from '../../db/pg';

import sequelize, {
    User,
    Contact
} from '../../models';

import {
    User as BUser,
    Contact as BContact
} from '../../models/bookshelf';

import MUser from '../../models/User';

const GCM_URL = 'https://gcm-http.googleapis.com/gcm/send';
const GCM_AUTH = 'key=AIzaSyAq-ia0b-MicHcSr4v_4CwLjFLAGMGPO8Y';

// const PROFILE_FOLDER_PREFIX = 'upload/';
//
// const writeStream = function*(file, filename) {
//     return new Promise((resolve, reject) => {
//         let stream = fs.createWriteStream(filename);
//         stream.on('finish', (e) => {
//             resolve();
//         });
//         stream.on('error', (e) => {
//             reject(e);
//         });
//         file.pipe(stream);
//     });
//
// };

export default (router) => {
    router
        .post('/user/gcm', isAuthenticated(), function*() {
            if (!this.request.body.gcm) {
                this.throw(400, 'empty gcm');
            }
            console.log(this.request.body.gcm);
            yield User.update({
                gcm: this.request.body.gcm
            }, {
                where: {
                    id: this.passport.user.id
                },
                returning: true
            });
            this.status = 201;
        })
        .post('/user/reset', isAuthenticated(), function*(next) {
            //push dummy data
            this.passport.user.measures = [{
                'type': 'weight',
                'frequency': 'daily',
                'time': new Date(29701000),
                'target': 170
            }, {
                'type': 'bloodSugar',
                'frequency': 'weekly',
                'time': new Date(29701000),
                'target': 100
            }, {
                'type': 'behavioralSurvey',
                'frequency': 'monthly',
                'time': new Date(29701000),
            }];
            this.passport.user.notify = {
                'schedule': 2,
                'message': 15
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
                'canChat': true,
                readOnly: true
            }, {
                'name': 'Allison Cameron',
                'email': 'dummy@adf.com',
                'phone': '1234567890',
                'type': 'CareManager',
                'photo': 'http://vignette1.wikia.nocookie.net/house/images/5/5c/AllisonCameron.png/revision/latest?cb=20070812160453',
                'canChat': true,
                readOnly: true
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
        .get('/user/me', isAuthenticated(), function*() {
            this.status = 200;
            //eager load contacts
            let user;
            for (let i = 0; i < 1000; i++) {
                ////Sequelize
                // user = yield User.find({
                //     where: {
                //         id: this.passport.user.id
                //     }
                // });

                ////Sequelize + contacts
                // user = yield User.find({
                //     where: {
                //         id: this.passport.user.id
                //     },
                //     include: [{
                //         model: Contact,
                //         as: 'contacts'
                //     }]
                // });

                ////bookshelf
                //user = yield new BUser({id: this.passport.user.id}).fetch();

                ///bookshelf+contacts
                // user = yield new BUser({id: this.passport.user.id}).fetch({
                //   withRelated: ['contacts']
                // });

                ////knex
                //user = yield knex.select().from('users').where({'users.id': this.passport.user.id});

                ////knex + contacts
                //user = yield knex.select().from('users').where({'users.id': this.passport.user.id}).leftJoin('contacts', 'users.id', 'contacts.userId');

                ////vanilla
                //user = yield sequelize.query('SELECT "id", "firstName", "lastName", "email", "password", "gcm", "measures", "tasks", "notify", "createdAt", "updatedAt" FROM "users" AS "user" WHERE "user"."id" = \'894d9eb4-4d99-4cb4-b700-6ffc3a64f9a1\';');

                ////vanilla + contacts
                //user = yield sequelize.query('SELECT "user"."id", "user"."firstName", "user"."lastName", "user"."email", "user"."password", "user"."gcm", "user"."measures", "user"."tasks", "user"."notify", "user"."createdAt", "user"."updatedAt", "contacts"."id" AS "contacts.id", "contacts"."firstName" AS "contacts.firstName", "contacts"."lastName" AS "contacts.lastName", "contacts"."type" AS "contacts.type", "contacts"."phone" AS "contacts.phone", "contacts"."email" AS "contacts.email", "contacts"."canChat" AS "contacts.canChat", "contacts"."readOnly" AS "contacts.readOnly", "contacts"."userId" AS "contacts.userId", "contacts"."createdAt" AS "contacts.createdAt", "contacts"."updatedAt" AS "contacts.updatedAt" FROM "users" AS "user" LEFT OUTER JOIN "contacts" AS "contacts" ON "user"."id" = "contacts"."userId" WHERE "user"."id" = \'894d9eb4-4d99-4cb4-b700-6ffc3a64f9a1\'', { type: sequelize.QueryTypes.SELECT});

                user = yield sequelize.query("select users.*, json_agg(contacts) as contacts from users left outer join contacts on users.id = contacts.\"userId\" where users.id = '894d9eb4-4d99-4cb4-b700-6ffc3a64f9a1' group by users.id");

                // user = yield sequelize.query('SELECT "id", "firstName", "lastName", "email", "password", "gcm", "measures", "tasks", "notify", "createdAt", "updatedAt" FROM "users" AS "user" WHERE "user"."id" = \'894d9eb4-4d99-4cb4-b700-6ffc3a64f9a1\';');
                // yield sequelize.query('SELECT "contacts"."id" AS "contacts.id", "contacts"."firstName" AS "contacts.firstName", "contacts"."lastName" AS "contacts.lastName", "contacts"."type" AS "contacts.type", "contacts"."phone" AS "contacts.phone", "contacts"."email" AS "contacts.email", "contacts"."canChat" AS "contacts.canChat", "contacts"."readOnly" AS "contacts.readOnly", "contacts"."userId" AS "contacts.userId", "contacts"."createdAt" AS "contacts.createdAt", "contacts"."updatedAt" AS "contacts.updatedAt" from "contacts" AS "contacts" WHERE "contacts"."userId" = \'894d9eb4-4d99-4cb4-b700-6ffc3a64f9a1\'', { type: sequelize.QueryTypes.SELECT});

                //mongoose
                // user = yield MUser.findOne({
                //   id: this.passport.user.id
                // });
                //user = yield MUser.findById('57406db796f6c76f4961a091');
            }

            this.body = user;
        })
        .get('/user/contacts', isAuthenticated(), function*() {
            try {
                let contacts = yield Contact.findAll({
                    userId: this.passport.user.id
                });
                this.body = contacts;
            } catch (e) {
                this.throw(400, e);
            }
        })
        .post('/user/measure', isAuthenticated(), function*() {
            try {
                yield User.update({
                    measures: sequelize.fn('array_append', sequelize.col('measures'), JSON.stringify(this.request.body))
                }, {
                    where: {
                        id: this.passport.user.id
                    }
                });
                this.status = 201;
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
        .post('/user/contacts', isAuthenticated(), function*() {
            try {
                let created = yield Contact.create({
                    userId: this.passport.user.id,
                    ...this.request.body
                }, {
                    returnning: true
                });
                console.log(created);
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
                            data: created
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
        .put('/user/contacts/:id', isAuthenticated(), function*() {
            let result = yield Contact.update(this.request.body, {
                where: {
                    id: this.params.id
                },
                returnning: true
            });
            this.status = 200;
            this.body = result;
        })
        .delete('/user/contacts/:id', isAuthenticated(), function*() {
            yield Contact.destroy({
                where: {
                    id: this.params.id
                }
            });
            this.status = 200;
        });
    // .get('/user/profile', isAuthenticated(), function*() {
    //     if (!this.passport.user.profile) {
    //         this.throw(400);
    //     }
    //     let filepath = PROFILE_FOLDER_PREFIX + this.passport.user.profile;
    //     let fstat = yield fs.statAsync(filepath);
    //     if (fstat.isFile()) {
    //         this.body = fs.createReadStream(filepath);
    //         this.type = path.extname(filepath);
    //     } else {
    //         this.throw(404);
    //     }
    //
    // })
    // .post('/user/profile', isAuthenticated(), function*() {
    //     let {
    //         files
    //     } = yield asyncBusboy(this.req);
    //
    //     if (!files.length) {
    //         this.throw(400, 'Invalid file type');
    //     }
    //
    //     let file = files[0];
    //     let filename = uuid.v4() + path.extname(file.filename);
    //     yield writeStream(file, PROFILE_FOLDER_PREFIX + filename);
    //     this.passport.user.profile = filename;
    //     yield this.passport.user.save();
    //     this.body = {
    //         file: filename
    //     };
    //
    // });
};