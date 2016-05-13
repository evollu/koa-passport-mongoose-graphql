import mongoose from 'mongoose';

const MEASURE_TYPES = ['weight', 'bloodSugar','bloodPressure', 'nebulizer', 'pedalEdema','behavioralSurvey','rescueInhaler'];

const TeamSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	phone: {
		type: String
	},
	type: {
		type: String,
		enum: ['CareManager', 'Spouse', 'Physician']
	},
	photo: {
		type: String,
	},
	canChat: {
		type: Boolean
	}
});

const MeasureSchema = new mongoose.Schema({
	type: {
		type: String,
		required: true,
		enum: MEASURE_TYPES
	},
	frequency: {
		type: String,
		required: true,
		enum: ['daily', 'weekly', 'monthly']
	},
	time: {
		type: Date,
		required: true,
	},
	target: {
		type: Number,
	}
});

const TaskSchema = new mongoose.Schema({
	type: {
		type: String,
		enum: MEASURE_TYPES,
		required: true
	},
	time: {
		type: Date,
		required: true
	}
});

const UserSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
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

export const UserConstraints = {
	name: { length: { maximum: 30 }},
	email: { email: true},
    passowrd: { length: { maximum: 30 }},
	phone: {
		format: {
			pattern: /^\d{9}$/,
			flags: 'i'
		}
	}
};

export default mongoose.model('User', UserSchema);