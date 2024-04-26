import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const getMessage = joi.object({
    recipientId : generalFields.id
}).required()

export const sendMessage = joi.object({
    content: joi.string().min(1).required(),
    recipientId : generalFields.id
}).required()