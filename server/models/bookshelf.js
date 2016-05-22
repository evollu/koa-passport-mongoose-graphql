const conString = 'postgres://evollu@localhost/mydb';
export const knex = require('knex')({client: 'pg', connection: conString});

var bookshelf = require('bookshelf')(knex);

export const User = bookshelf.Model.extend({
  tableName: 'users',
  contacts: function() {
    return this.hasMany(Contact, 'userId');
  }
});

export const Contact = bookshelf.Model.extend({
  tableName: 'contacts',
  user: function(){
    return this.belongsTo(User, 'userId');
  }
});