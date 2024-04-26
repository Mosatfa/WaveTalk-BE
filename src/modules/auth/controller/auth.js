import { asyncHandler } from "../../../utils/errorHandling.js"
import userModel from "../../../../DB/model/User.model.js"
import { hash, compare } from "../../../utils/HashAndCompare.js"
import { generateToken, verifyToken } from "../../../utils/GenerateAndVerifyToken.js"
import sendEmail from "../../../utils/SendEmail.js"



export const signUp = asyncHandler(async (req, res, next) => {
    const { userName, email, password } = req.body;

    if (await userModel.findOne({ email: email.toLowerCase() })) {
        return next(new Error("Email is Already Registered", { casue: 409 }))
    }
    if (await userModel.findOne({ userName: userName.toLowerCase() })) {
        return next(new Error("UserName is Already Exist", { casue: 409 }))
    }

    // generate Token
    const token = generateToken({ payload: { email: email.toLowerCase() }, signature: process.env.TOKEN_EMAIL, expiresIn: 60 * 5 })
    const refreshToken = generateToken({ payload: { email: email.toLowerCase() }, signature: process.env.TOKEN_EMAIL, expiresIn: 60 * 60 * 24 * 30 * 12 })

    // links html 
    const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}`
    const refreshLink = `${req.protocol}://${req.headers.host}/auth/requestNewConfirmEmail/${refreshToken}`

    // template html
    const html = `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
            * {
                padding: 0;
                margin: 0;
                border: 0;
                box-sizing: border-box;
            }
        </style>
    </head>
    <body style="max-width: 600px; margin: auto; font-family: Arial, Helvetica, sans-serif;">
        <div class="wrapper">
            <header style="padding: 15px 20px 0px;">
                <a href="#" target="_blank"
                    style="font-size: 32px; font-weight: bold; color: #0194FE; text-decoration: none;">
                    SwiftConnect
                </a>
            </header>
            <div class="content" style="padding: 40px 20px;">
                <h1 style="font-size: 32px; margin-bottom: 20px;">Verify Your Email Address</h1>
                <p style="margin-bottom: 20px; font-size: 16px; color: #353740;">To continue setting up your SwiftConnect
                    account, please verify that this is your email address.</p>
                <div style="margin-top: 32px;">
                    <a href="${link}"
                        style="padding: 20px 16px; background-color: #0194FE; color: #fff; margin-top: 60px;text-decoration: none; border-radius: 5px;">Verify
                        Email Address</a>
                </div>
            </div>
            <p style="padding: 0px 20px 20px; font-size: 13px; color: #6e6e80;">This link will expire in 5 minutes. if you
                did not make this request, Click on this link to send another
                request <a href="${refreshLink}" style="text-decoration: underline !important; color: blue;">New Request</a></p>
        </div>
    </body>
    
    </html>`

    // send Email
    // if (!await sendEmail({ to: email, subject: "Authenticate Your Email Address", html })) {
    //     return next(new Error("Email Rejected", { casue: 400 }))
    // }

    const hashPassword = hash({ plaintext: password })
    const user = await userModel.create({ userName, email: email.toLowerCase(), password: hashPassword })

    return res.status(201).json({ message: "Done", _id: user._id })
})

export const confirmEmail = asyncHandler(async (req, res, next) => {
    const { email } = verifyToken({ token: req.params.token, signature: process.env.TOKEN_EMAIL })
        ;
    if (!email) {
        return next(new Error("In-Valid token payload", { cause: 400 }))
    }

    const user = await userModel.updateOne({ email }, { isVerifide: true })
    if (user.matchedCount) {
        return res.status(200).redirect("http://localhost:4200/login")
    } else {
        return res.status(400).redirect("link front end 404 page")
    }
})

export const requestNewConfirmEmail = asyncHandler(async (req, res, next) => {

    const { email } = verifyToken({ token: req.params.token, signature: process.env.TOKEN_EMAIL })
    if (!email) {
        return next(new Error("In-Valid token payload", { cause: 400 }))
    }


    const user = await userModel.findOne({ email })
    if (!user) {
        return next(new Error("Not register account", { cause: 400 }))
    }
    if (user.isVerifide) {
        return res.status(200).redirect("http://localhost:4200/login")
    }

    //generate token
    const newtoken = generateToken({ payload: { email: email.toLowerCase() }, signature: process.env.TOKEN_EMAIL, expiresIn: 60 * 5 })


    const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${newtoken}`
    const refreshLink = `${req.protocol}://${req.headers.host}/auth/reqNewConfirmEmail/${req.params.token}`

    //template email
    const html = `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
            * {
                padding: 0;
                margin: 0;
                border: 0;
                box-sizing: border-box;
            }
        </style>
    </head>
    <body style="max-width: 600px; margin: auto; font-family: Arial, Helvetica, sans-serif;">
        <div class="wrapper">
            <header style="padding: 15px 20px 0px;">
                <a href="#" target="_blank"
                    style="font-size: 32px; font-weight: bold; color: #0194FE; text-decoration: none;">
                    SwiftConnect
                </a>
            </header>
            <div class="content" style="padding: 40px 20px;">
                <h1 style="font-size: 32px; margin-bottom: 20px;">Verify Your Email Address</h1>
                <p style="margin-bottom: 20px; font-size: 16px; color: #353740;">To continue setting up your SwiftConnect
                    account, please verify that this is your email address.</p>
                <div style="margin-top: 32px;">
                    <a href="${link}"
                        style="padding: 20px 16px; background-color: #0194FE; color: #fff; margin-top: 60px;text-decoration: none; border-radius: 5px;">Verify
                        Email Address</a>
                </div>
            </div>
            <p style="padding: 0px 20px 20px; font-size: 13px; color: #6e6e80;">This link will expire in 5 minutes. if you
                did not make this request, Click on this link to send another
                request <a href="${refreshLink}" style="text-decoration: underline !important; color: blue;">New Request</a></p>
        </div>
    </body>
    
    </html>`
    //send email
    if (!await sendEmail({ to: email, subject: "Authenticate Your Email Address", html })) {
        return next(new Error("Email Rejected", { cause: 400 }))
    }

    return res.status(200).json({ message: 'Done' })
})

export const logIn = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email: email }) //.toLowerCase()

    if (!user) {
        return next(new Error("In-Valid email or password", { casue: 404 }))
    }
    if (!user.isVerifide) {
        return next(new Error("Please check your email first to confirm your email", { casue: 400 }))
    }
    if (!compare({ plaintext: password, hashValue: user.password })) {
        return next(new Error("In-Valid email or password", { casue: 400 }))
    }

    const acc_token = generateToken({ payload: { id: user._id, islogin: true }, expiresIn: 60 * 60 * 24 * 30 * 6 })
    return res.status(200).json({ message: "Done", acc_token })
})

export const forgetPassword = asyncHandler(async (req, res, next) => {

    const user = await userModel.findOne({ email: req.body.email.toLowerCase() })
    if (!user) {
        return next(new Error("In-Valid Email", { casue: 400 }))
    }

    const token = generateToken({ payload: { id: user._id }, signature: process.env.TOKEN_EMAIL, expiresIn: 60 * 5 })
    // link frontEnd/token
    //redirctto page restPassword
    const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
            * {
                padding: 0;
                margin: 0;
                border: 0;
                box-sizing: border-box;
            }
        </style>
    </head>
    <body style="max-width: 600px; margin: auto; font-family: Arial, Helvetica, sans-serif;">
        <div class="wrapper">
            <header style="padding: 15px 20px 0px;">
                <a href="#" target="_blank"
                    style="font-size: 32px; font-weight: bold; color: #0194FE; text-decoration: none;">
                    SwiftConnect
                </a>
            </header>
            <div class="content" style="padding: 40px 20px;">
                <h1 style="font-size: 32px; margin-bottom: 20px;">Reset Password</h1>
                <p style="margin-bottom: 20px; font-size: 16px; color: #353740;">We have received a request to reset your
                    password. Please confirm the reset to choose a new password. Otherwise, you can ignore this email.</p>
                <div style="margin-top: 32px;">
                    <a href="${token}"
                        style="padding: 20px 16px; background-color: #0194FE; color: #fff; margin-top: 60px;text-decoration: none; border-radius: 5px;">Reset
                        Password</a>
                </div>
            </div>
            <p style="padding: 0px 20px 20px; font-size: 16px; color: #6e6e80; text-align: center;"><a href="" style="text-decoration: underline !important; color: #0194FE;">SwiftConnect.com</a></p>
        </div>
    </body>
    </html>`


    // send Email
    if (!await sendEmail({ to: user.email, subject: "Reset password", html })) {
        return next(new Error("Email Rejected", { casue: 400 }))
    }
    return res.status(200).json({ message: "Done", token })
})

export const restPassword = asyncHandler(async (req, res, next) => {
    const { id } = verifyToken({ token: req.params.token, signature: process.env.TOKEN_EMAIL })

    const user = await userModel.findById(id)
    if (!user) {
        return next(new Error("In-Valid Email", { casue: 400 }))
    }

    req.body.password = hash({ plaintext: req.body.password })
    await userModel.updateOne({ _id: user._id }, req.body)

    return res.status(200).json({ message: "Done" })
})

export const changePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body

    const user = await userModel.findById(req.user._id)
    if (!compare({ plaintext: currentPassword, hashValue: user.password })) {
        return next(new Error("password does not match", { casue: 400 }))
    }

    user.password = hash({ plaintext: newPassword })
    await user.save()

    return res.status(200).json({ message: "Done" })
})
