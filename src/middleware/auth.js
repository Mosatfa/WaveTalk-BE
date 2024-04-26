import groupModel from "../../DB/model/Group.model.js";
import userModel from "../../DB/model/User.model.js";
import { verifyToken } from "../utils/GenerateAndVerifyToken.js";
import { asyncHandler } from "../utils/errorHandling.js";
import { getIo } from "../utils/server.js";


export const auth = asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization?.startsWith(process.env.BEARER_KEY)) {
        return next(new Error(`In-valid Bearer Key`, { cause: 400 }))
    }

    const token = authorization.split(process.env.BEARER_KEY)[1]
    if (!token) {
        return next(new Error(`In-valid Token`, { cause: 400 }))
    }

    const decoded = verifyToken({ token })
    if (!decoded?.id) {
        return next(new Error(`In-valid Token Payload`, { cause: 400 }))
    }
    const user = await userModel.findById(decoded.id).select('userName profilePicture friends friendRequest sendRequest') //.select("userName image role changePasswordTime password s")
    if (!user) {
        return next(new Error(`Not Register Account`, { cause: 401 }))
    }

    // console.log({changePasswordTime:parseInt(  user.changePasswordTime?.getTime()/ 1000) , tokeniat :decoded.iat});
    // if(parseInt(  user.changePasswordTime?.getTime()/ 1000) > decoded.iat){
    //     return next(new Error(`Expired Token`, { cause: 400 }))
    // }

    if (req.params.AdminId) {
        if (!await groupModel.findOne({ admin: { $in: [user._id] } })) {
            return next(new Error(`Not authorized Account`, { cause: 403 }))
        }
    }

    req.user = user;
    return next()
})


export const socketAuth = async (authorization, accessRoles = [], socketId) => {
    try {
        if (!authorization?.startsWith(process.env.BEARER_KEY)) {
            getIo().to(socketId).emit("authSocket", "In-valid Bearer Key")
            return false
        }

        const token = authorization.split(process.env.BEARER_KEY)[1]
        if (!token) {
            getIo().to(socketId).emit("authSocket", "In-valid Token")
            return false
        }

        const decoded = verifyToken({ token })
        if (!decoded?.id) {
            getIo().to(socketId).emit("authSocket", "In-valid Token Payload")
            return false
        }

        const user = await userModel.findById(decoded.id)
        if (!user) {
            getIo().to(socketId).emit("authSocket", "Not Register Account")
            return false
        }

        // if (!accessRoles.includes(user.role)) {
        //     getIo().to(socketId).emit("authSocket", "Not authorized Account")
        //     return false
        // }

        return user
    } catch (error) {
        getIo().to(socketId).emit("authSocket", error)
        return false
    }
}


