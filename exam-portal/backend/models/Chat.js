const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    response: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Add virtual for id compatibility
chatSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

chatSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        ret.id = ret._id;
        return ret;
    }
});

module.exports = mongoose.model('Chat', chatSchema);
