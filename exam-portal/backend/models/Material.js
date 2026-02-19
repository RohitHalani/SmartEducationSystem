const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    subject: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['notes', 'pyq', 'syllabus', 'reference']
    },
    year: {
        type: Number,
        default: null
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    uploadedByName: {
        type: String,
        default: 'Faculty'
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    downloads: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Add virtual for id compatibility
materialSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

materialSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        ret.id = ret._id;
        return ret;
    }
});

module.exports = mongoose.model('Material', materialSchema);
