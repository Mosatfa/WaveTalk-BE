import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'


export const signUp = joi.object({
    userName: joi.string().min(2).max(36).required(),
    email: generalFields.email,
    password: generalFields.password,
}).required()

export const token = joi.object({
    token: joi.string().required()
}).required()

export const logIn = joi.object({
    email: generalFields.email,
    password: generalFields.password,
}).required()

export const forgetPassword = joi.object({
    email: generalFields.email
}).required()

export const resetPassword = joi.object({
    token: joi.string().required(),
    password: generalFields.password,
    cPassword: generalFields.cPassword.valid(joi.ref('password')).messages({'any.only':'Confirm password not match password'})
}).required()

export const changePassword = joi.object({
    currentPassword: generalFields.password,
    newPassword: generalFields.password,
    cPassword: generalFields.cPassword.valid(joi.ref('newPassword')).messages({'any.only':'Confirm password not match password'})
}).required()

