import Sequelize from 'sequelize';
const connString = 'postgres://evollu@localhost/mydb';

let sequelize = new Sequelize(connString);

export const User = sequelize.define('user', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  lastName: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  email: {
    type: Sequelize.TEXT,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  gcm: {
    type: Sequelize.TEXT
  },
  measures: {
    type: Sequelize.ARRAY(Sequelize.JSONB)
  },
  tasks: {
    type: Sequelize.ARRAY(Sequelize.JSONB)
  },
  notify: {
    type: Sequelize.JSONB
  }
});

export const Contact = sequelize.define('contact', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: Sequelize.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  lastName: {
    type: Sequelize.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  type: {
    type: Sequelize.ENUM('CareManager', 'Spouse', 'Physician'),
    allowNull: false
  },
  phone: {
    type: Sequelize.TEXT,
    validate: {
      is: /^\d{10}$/
    }
  },
  email: {
    type: Sequelize.TEXT
  },
  canChat: {
    type: Sequelize.BOOLEAN
  },
  readOnly: {
    type: Sequelize.BOOLEAN
  },
  userId: {
    type: Sequelize.UUID
  }
});

User.hasMany(Contact, {as: 'contacts'});

export default sequelize;
