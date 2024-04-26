import mongoose, { Schema, Types, model } from 'mongoose'

const userSchema = new Schema({
    socketId: String,
    profile_Picture: Object,
    avater: String,
    bio: String,
    userName: { type: String, required: true, unique: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    isVerifide: { type: Boolean, default: false },
    status: { type: String, default: 'offline', enum: ['offline', 'online'] },
    isDeleted : {type:Boolean , default: false},
    friends: [{
        type: Types.ObjectId, ref: 'User', required: true,
    }],
    friendRequest: [{
        type: Types.ObjectId, ref: 'User', required: true,
    }],
    sendRequest: [{
        type: Types.ObjectId, ref: 'User', required: true,
    }],
    blockList: [{
        type: Types.ObjectId, ref: 'User', required: true,
    }],
    // chats: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Convertion'
    // }],
    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }]
}, {
    timestamps: true
})

const userModel = mongoose.models.User || model('User', userSchema)

export default userModel