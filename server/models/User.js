import mongoose from 'mongoose-fill';

const ContactSchema = new mongoose.Schema({
  name: {
      type: String,
      required: true
  },
  email: {
      type: String,
      required: true
  }
});

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false,
        index: true,
    },
    password: {
        type: String,
        required: true,
    },
    contacts: [ContactSchema]
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
});

export default mongoose.model('User', UserSchema);