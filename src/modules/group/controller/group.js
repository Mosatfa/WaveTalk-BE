import convertionModel from "../../../../DB/model/Convertion.model.js";
import groupModel from "../../../../DB/model/Group.model.js";
import messageModel from "../../../../DB/model/Message.mode.js";
import userModel from "../../../../DB/model/User.model.js";
import cloudinary from "../../../utils/cloudinary.js"
import { asyncHandler } from "../../../utils/errorHandling.js";
import { getIo } from "../../../utils/server.js";


export const getGroup = asyncHandler(async (req, res, next) => {
    const group = await find({ participants: { $in: [req.user._id] } })
    return res.json({ message: 'Done', group })
})

export const getMessagesGroup  = asyncHandler(async (req, res, next) => {
    const group = await groupModel.findById(req.query.g) 
    if (!group) {
        return next(new Error("In-valid Group Id"))
    }
    const messages = await convertionModel.find({ group: g, userId: req.user._id }).select('messages').populate('messages')
    return res.status(200).json({ message: "Done", messages })
})

export const createGroup = asyncHandler(async (req, res, next) => {
    const { name, memberIds } = req.body;
    participants.push(req.user._id)
    const group = await groupModel.create({
        name,
        creator: req.user._id,
        participants: memberIds,
        admin: [req.user._id]
    })
    
    for (const member of memberIds) {
        await userModel.updateOne({ _id: member }, { $addToSet: { groups: group._id } })
    }
    return res.status(201).json({ message: 'Done', group })
})

export const addMember = asyncHandler(async (req, res, next) => {
    const { memberIds } = req.body;

    const group = await groupModel.findOne({ _id: req.params.groupAdminId, participants: { $nin: [memberIds] } })
    if (!group) {
        return next(new Error("In Valid group Id or member Id", { cause: 400 }))
    }

    group.participants.push(memberIds)
    await group.save()
    
    for (const member of memberIds) {
        await userModel.updateOne({ _id: member }, { $addToSet: { groups: group._id } })
    }

    return res.status(200).json({ message: 'Done', group })
})

export const removeMember = asyncHandler(async (req, res, next) => {
    const { memberId } = req.body;

    const group = await groupModel.findOne({ _id: req.params.groupAdminId, participants: { $in: [memberId] } })
    if (!group) {
        return next(new Error("In Valid group Id or member Id", { cause: 400 }))
    }

    group.participants.pull(memberId)
    await group.save()

    return res.status(200).json({ message: 'Done', group })
})

export const addAdmin = asyncHandler(async (req, res, next) => {
    const { memberId } = req.body;

    const group = await groupModel.findOne({ _id: req.params.groupAdminId, participants: { $nin: [memberId] } })
    if (!group) {
        return next(new Error("In Valid group Id or member Id", { cause: 400 }))
    }
    if (group.admin.includes(memberId)) {
        return next(new Error("already member admin", { cause: 400 }))
    }

    group.admin.push(memberId)
    await group.save()

    return res.status(200).json({ message: 'Done', group })
})

export const removeAdmin = asyncHandler(async (req, res, next) => {
    const { memberId } = req.body;

    const group = await groupModel.findOne({ _id: req.params.groupAdminId, admin: { $in: [memberId] } })
    if (!group) {
        return next(new Error("In Valid group Id or memberId", { cause: 400 }))
    }

    group.admin.pull(memberId)
    await group.save()

    return res.status(200).json({ message: 'Done', group })
})

export const leaveGroup = asyncHandler(async (req, res, next) => {
    const group = await groupModel.findOne({ _id: req.params.groupId, participants: { $in: [req.user._id] } })
    if (!group) {
        return next(new Error("In Valid group Id or memberId", { cause: 400 }))
    }

    group.participants.pull(memberId)
    await group.save()

    return res.status(200).json({ message: 'Done', group })
})

export const updateGroup = asyncHandler(async (req, res, next) => {
    const group = await groupModel.findById(req.params.groupAdminId)
    if (!group) {
        return next(new Error("In Valid group Id", { cause: 400 }))
    }
    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/group/${group._id}` })
        await cloudinary.uploader.destroy(group?.group_Picture.public_id)
        req.body.group_Picture = { secure_url, public_id }
    }
    const updateGroup = await groupModel.updateOne({ _id: group._id }, req.body)
    return group ? res.status(200).json({ message: 'Done', results: updateGroup }) : next(new Error("In Valid groupI d", { cause: 400 }))
})

export const sendMessageToGroup = asyncHandler(async (req, res, next) => {
    const { content } = req.body

    const group = await groupModel.findById(req.params.groupId)
    if (!group || !group.participants.includes(req.user._id)) {
        return next(new Error("Unauthorized access to group", { cause: 400 }))
    }

    // create new message
    const message = await messageModel.create({
        content,
        sender: req.user._id,
        group: group._id
    })

    let user;
    for (const member of group.participants) {
        user = await userModel.findById(member)
        getIo.to(user.socketId).emit('messageGroup', message)
    }
    // getIo.to(group._id).emit('message', message)
    return res.status(200).json({ message: 'Done', message })
})