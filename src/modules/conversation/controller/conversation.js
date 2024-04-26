import userModel from "../../../../DB/model/User.model.js";
import messageModel from "../../../../DB/model/Message.mode.js";
import { asyncHandler } from "../../../utils/errorHandling.js"
import convertionModel from "../../../../DB/model/Convertion.model.js";
import { getIo } from "../../../utils/server.js";

// dirct chat and groups
export const getAllConversations = asyncHandler(async (req, res, next) => {
    let conversations = await userModel.findById(req.user._id).select('friends groups').populate('friends groups')
    conversations = conversations.friends.concat(conversations.groups)
    return res.status(200).json({ message: "Done", conversations })
})

export const sendMessage = asyncHandler(async (req, res, next) => {
    const { content, recipientId } = req.body;

    const destUser = await userModel.findById(recipientId)
    if (!destUser) {
        return next(new Error("In-valid userId", { cause: 404 }))
    }

    const newMessage = await messageModel.create({
        content,
        sender: req.user._id,
        recipient: recipientId
    })

    // Find or create a conversation for the sender
    let senderConversation = await convertionModel.findOne({
        userId: req.user._id,
        receiverId: recipientId,
    });

    if (!senderConversation) {
        senderConversation = await convertionModel.create({
            userId: req.user._id,
            receiverId: recipientId,
        });
        // Update the sender's chats
        // await userModel.updateOne(
        //     { _id: req.user._id },
        //     { $push: { chats: senderConversation._id } }
        // );
    }


    // Find or create a conversation for the receiver
    let receiverConversation = await convertionModel.findOne({
        userId: recipientId,
        receiverId: req.user._id,
    });

    if (!receiverConversation) {
        console.log(' create receiver');

        receiverConversation = await convertionModel.create({
            userId: recipientId,
            receiverId: req.user._id,
        });
        console.log(receiverConversation);
        // Update the receiver's chats
        // await userModel.updateOne(
        //     { _id: recipientId },
        //     { $push: { chats: receiverConversation._id } }
        // );
    }

    // Update sender's conversation with the new message
    senderConversation.messages.push(newMessage._id)
    await senderConversation.save()

    // Update receiver's conversation with the new message
    receiverConversation.messages.push(newMessage._id)
    await receiverConversation.save()


    getIo().to(destUser.socketId).emit('receiveMessage', content)
    return res.status(201).json({ message: "Done", newMessage })
})

export const getMessagesCoversation = asyncHandler(async (req, res, next) => {
    const { recipientId } = req.query;
    const messages = await convertionModel.find({ receiverId: recipientId, userId: req.user._id }).select('messages').populate('messages')
    return res.status(200).json({ message: "Done", messages })
})


