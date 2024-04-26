import mongoose, { Schema, Types, model } from 'mongoose'

const messageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    content: {
        type: String,
        required: true
    },
    status:{
        type:String,
        default:'Sent',
        enum:['Sent','Delivered','Seen']
    },
    group: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
    }

}, {
    timestamps: true
})

const messageModel = mongoose.models.Message || model('Message', messageSchema)

export default messageModel