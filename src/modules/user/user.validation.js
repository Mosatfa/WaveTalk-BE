import joi from 'joi';
import { generalFields } from '../../middleware/validation.js';

export const updateUser = joi.object({
    userName: joi.string().min(2).max(36),
    bio: joi.string().min(1).max(150),
    file: generalFields.file
}).required()