import mongoose from 'mongoose';

const MeasureSchema = new mongoose.Schema({
    weight: {
        type: Number,
    },
    bloodSugar: {
        type: Number
    }
}, {
    timestamps: {
        createdAt: 'createdAt'
    },
});

export default mongoose.model('Measure', MeasureSchema);