import mongoose from 'mongoose';

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
    profile: String,
    contacts: [ContactSchema]
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
});

export default mongoose.model('User', UserSchema);