import mongoose, { Schema, Types, model } from 'mongoose'

const convertionSchema = new Schema({
    receiverId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }],
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, {
    timestamps: true
})

const convertionModel = mongoose.models.Convertion || model('Convertion', convertionSchema)

export default convertionModel
