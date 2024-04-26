import { asyncHandler } from "../../../utils/errorHandling.js"
import userModel from "../../../../DB/model/User.model.js"
import cloudinary from "../../../utils/cloudinary.js"


// export const getUsers = asyncHandler(async (req, res, next) => {
//     const users = await userModel.find({
//         $and: [
//             { _id: { $ne: req.user._id } },
//             { _id: { $nin: req.user.friends } },
//             { _id: { $nin: req.user.friendRequest } },
//             { _id: { $nin: req.user.sendRequest } },
//         ]
//     }).select('_id userName profilePicture')
//     return res.json({ message: 'Done', result: users })
// })

export const getUser = asyncHandler(async (req, res, next) => {
    const user = await userModel.findById(req.user._id).select('_id userName email profilePicture bio status')
    const [localPart, domainPart] = user.email.split('@');
    user.email = '*'.repeat(localPart.length) + domainPart
    return res.json({ message: 'Done', result: user })
})

export const updateUser = asyncHandler(async (req, res, next) => {
    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/profile/${req.user._id}` })
        await cloudinary.uploader.destroy(user.profilePicture.public_id)
        req.body.profilePicture = { secure_url, public_id }
    }

    const updateUser = await userModel.updateOne({ _id: req.user._id }, req.body)
    return updateUser.matchedCount ? res.status(200).json({ message: 'Done', user: updateUser }) : next(new Error('falid to update'))
})

export const deleteUser = asyncHandler(async (req, res, next) => {

    const deleteUser = await userModel.updateOne({ _id: req.user._id },
        {
            userName: 'Delete Account',
            email : '',
            isDeleted: true,
        }
    )
    return deleteUser.matchedCount ? res.status(200).json({ message: 'Done', user: deleteUser }) : next(new Error('falid to deleteUser'))
})