import * as authController from './controller/auth.js'
import * as validitors from './auth.validation.js'
import { validation } from '../../middleware/validation.js';
import { auth } from '../../middleware/auth.js';

import { Router } from 'express';



const router = Router();


router.post('/signup',
    validation(validitors.signUp),
    authController.signUp
)
router.get('/confirmEmail/:token',
    validation(validitors.token),
    authController.confirmEmail
)
router.get('/requestNewConfirmEmail/:token',
    validation(validitors.token),
    authController.requestNewConfirmEmail
)
router.post('/login',
    validation(validitors.logIn),
    authController.logIn
)
router.post('/forgetPassword',
    validation(validitors.forgetPassword),
    authController.forgetPassword
)
router.patch('/resetPassword/:token',
    validation(validitors.resetPassword),
    authController.restPassword
)

router.patch('/changePassword',
    auth,
    validation(validitors.changePassword),
    authController.changePassword
)




export default router