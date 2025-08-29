const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please provide a title for your post"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Please provide a description for your post"],
        trim: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true })

module.exports = mongoose.model('Post', postSchema);