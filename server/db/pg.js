const conString = 'postgres://evollu@localhost/mydb';
export const knex = require('knex')({client: 'pg', connection: conString});

import sequelize from '../models';

class PG {
    connect() {
        //await knex.migrate.latest([migrateConfig]);
        sequelize.sync({force: false}).then(result=>{
          console.log('Connected postgres');
        });

    }
}

export default new PG();