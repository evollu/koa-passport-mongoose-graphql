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
	},
	readOnly: {type: Boolean}
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
	gcm: {
		type: String
	},
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
		unqiue: true
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
		schedule: Number,
		message: Number
	}
}, {
	timestamps: {
		createdAt: 'createdAt',
		updatedAt: 'updatedAt',
	},
});

export const UserConstraints = {
	firstName: { length: { maximum: 30 }},
	lastName: { length: { maximum: 30 }},
	email: { email: true},
    passowrd: { length: { maximum: 30 }},
	phone: {
		format: {
			pattern: /^\d+$/,
			flags: 'i'
		}
	}
};

export default mongoose.model('User', UserSchema);