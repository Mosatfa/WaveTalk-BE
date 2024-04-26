import * as userController from './controller/user.js'
import * as validitors from './user.validation.js'
import { validation } from '../../middleware/validation.js';
import { auth } from '../../middleware/auth.js';
import { Router } from 'express';



const router = Router();

router.get('/',
    auth,
    userController.getUser
)

router.put('/update',
    auth,
    validation(validitors.updateUser),
    userController.updateUser
)

router.patch('/delete',
    userController.deleteUser
)
export default router