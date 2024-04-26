import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const getRequest = joi.object({
    r : joi.string().valid("friends","friendRequest","sendRequest").required()
}).required()

export const friend = joi.object({
    friendId : generalFields.id
}).required()