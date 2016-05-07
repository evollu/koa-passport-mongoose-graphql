import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    from: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: false,
    }
}, {
    timestamps: {
        createdAt: 'createdAt'
    },
});

export default mongoose.model('Message', MessageSchema);