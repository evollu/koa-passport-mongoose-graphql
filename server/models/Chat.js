import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
    users: [{
        name: {
            type: String,
            required: true
        },
        lastView: {
            type: Date
        }
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }]
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
});

export default mongoose.model('Chat', ChatSchema);