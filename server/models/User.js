import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		index: true
	},
	email: {
		type: String,
		required: true,
		index: true
	},
	phone: {
		type: String
	},
	canChat: {
		type: Boolean
	}
});

const MeasureSchema = new mongoose.Schema({
	type: {
		type: String,
		required: true,
        index: true,
		enum: ['weight', 'bloodSugar']
	},
	frequecy: {
		type: String,
		required: true,
        index: true,
		enum: ['daily', 'weekly', 'monthly']
	},
	time: {
		type: Date,
		required: true,
        index: true
	},
	target: {
		type: Number,
        index: true,
        required: true
	}
});

const TaskSchema = new mongoose.Schema({
	type: {
		type: String,
		enum: ['weight', 'bloodSugar'],
		required: true
	},
	time: {
		type: Date,
		required: true
	}
});

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		index: true,
	},
	email: {
		type: String,
		required: true,
		index: true,
	},
	password: {
		type: String,
		required: true,
		index: true
	},
	profile: String,
	team: [TeamSchema],
	measures: [MeasureSchema],
	chats: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Chat'
	}],
	tasks: [TaskSchema],
	notify: {
		chat: Number,
		task: Number
	}
}, {
	timestamps: {
		createdAt: 'createdAt',
		updatedAt: 'updatedAt',
	},
});

export default mongoose.model('User', UserSchema);