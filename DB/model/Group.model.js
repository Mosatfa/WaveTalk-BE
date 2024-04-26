import mongoose, { Schema, Types, model } from 'mongoose'

const groupSchema = new Schema({
    group_Picture: Object,
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    admin: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    // messages: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Message'
    // }]
}, {
    timestamps: true
})

const groupModel = mongoose.models.Group || model('Group', groupSchema)

export default groupModel
