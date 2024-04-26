import convertionModel from "../../../../DB/model/Convertion.model.js";
import userModel from "../../../../DB/model/User.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { getIo } from "../../../utils/server.js";

export const getRequest = asyncHandler(async (req, res, next) => {
    const { r } = req.query
    const request = await userModel.findById(req.user._id, { r: true }).populate(`${r}`, '_id userName profilePicture')
    return res.status(200).json({ message: "Done", result: request })
})

export const addFriend = asyncHandler(async (req, res, next) => {
    const { friendId } = req.body
    // check friendId
    const friend = await userModel.findById(friendId)
    if (!friend) {
        return next(new Error("In-valid user Id", { cause: 400 }))
    }

    const requestingUser = await userModel.findOne({
        _id: req.user._id,
        friends: { $nin: [friendId] },
        sendRequest: { $in: [friendId] }
    })

    if (requestingUser || String(friendId) == String(req.user._id)) {
        return next(new Error("You are already friends", { cause: 400 }))
    }


    await userModel.updateOne({ _id: req.user._id },
        {
            $addToSet: { sendRequest: friend._id }
        }
    )


    //add userID friendRequest 
    friend.friendRequest.push(req.user._id)
    await friend.save()

    //  send notification
    getIo().to(friend.socketId).emit('addFriendRequest', req.user)
    return res.status(200).json({ message: "Done" })
}) // Done

export const cancelFriendRequest = asyncHandler(async (req, res, next) => {
    const { friendId } = req.body

    const checkReq = await userModel.findOne({_id : req.user._id , sendRequest: { $in: [friendId] }})
    if (!checkReq) {
        return next(new Error("In-valid friend Id", { cause: 400 }))
    }

    // remove friend from sendRequest
    await userModel.updateOne({ _id: req.user._id },
        {
            $pull: { sendRequest: friendId }
        }
    )

    // remove userId from friendRequest
    await userModel.updateOne({ _id: friendId },
        {
            $pull: { friendRequest: req.user._id }
        }
    )

    return res.status(200).json({ message: "Done" })
}) // Done

export const acceptFriendRequest = asyncHandler(async (req, res, next) => {
    const { friendId } = req.body

    const checkReq = await userModel.findOne({_id : req.user._id , friendRequest: { $in: [friendId] }})
    console.log(checkReq);
    if (!checkReq) {
        return next(new Error("In-valid friend Id", { cause: 400 }))
    }
   

    await userModel.updateOne({ _id: req.user._id }, {
        $pull: { friendRequest: friendId }, //remove friend form friendRequest  
        $addToSet: { friends: friendId }    //add friend in friends
    })

    const friend = await userModel.updateOne({ _id: friendId }, {
        $pull: { sendRequest: req.user._id }, //remove userId form sendRequest  
        $addToSet: { friends: req.user._id }  //add userId in friends
    })

    // Find or create chat
    // const existingChat = await convertionModel.findOne({ userId: req.user._id, receiverId: friendId })
    // if (!existingChat) {
    //     await convertionModel.insertMany([
    //         { userId: req.user._id, receiverId: friendId },
    //         { userId: friendId, receiverId: req.user._id }
    //     ])

    //     await userModel.updateOne({ _id: req.user._id }, { $push: { chats: newChat[0]._id } });
    //     await userModel.updateOne({ _id: friendId }, { $push: { chats: newChat[1]._id } });
    // }

    // send notification
    getIo().to(friend.socketId).emit('acceptFriendRuquest', req.user)
    return res.status(200).json({ message: "Done" })
}) // Done

export const rejectFriendRequest = asyncHandler(async (req, res, next) => {
    const { friendId } = req.body

    const checkReq = await userModel.findOne({_id : req.user._id , friendRequest: { $in: [friendId] }})

    if (!checkReq) {
        return next(new Error("In-valid friend Id", { cause: 400 }))
    }

    await userModel.updateOne({ _id: req.user._id }, {
        $pull: { friendRequest: friendId } //remove friend form friendRequest
    })
    await userModel.updateOne({ _id: friendId }, {
        $pull: { sendRequest: req.user._id } //remove userId form sendRequest
    })

    return res.status(200).json({ message: "Done" })
}) // Done

export const unFriend = asyncHandler(async (req, res, next) => {
    const { friendId } = req.body

    const checkReq = await userModel.findOne({_id : req.user._id , friends: { $in: [friendId] }})
    if (!checkReq) {
        return next(new Error("In-valid friend Id", { cause: 400 }))
    }

    await userModel.updateOne({ _id: req.user._id }, {
        $pull: { friends: friendId} //remove friend from friends
    })
    await userModel.updateOne({ _id: friendId }, {
        $pull: { friends: req.user._id } //remove userID from friends
    })

    return res.status(200).json({ message: "Done" })
})  // Done



