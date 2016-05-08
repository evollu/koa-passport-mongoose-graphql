//TODO: move this into chat once graffiti uses connect for nested docs

import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        index: true,
        required: true
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        require: true
    },
    text: {
        type: String,
        index: true,
        required: true
    }
}, {
    timestamps: {
        createdAt: 'createdAt'
    },
});

export default mongoose.model('Message', MessageSchema);