import * as friendController from './controller/friend.js'
import * as validitors from './friend.validation.js'
import { validation } from '../../middleware/validation.js';
import { auth } from '../../middleware/auth.js';
import { Router } from 'express';



const router = Router();

// get friends user & get friendRequest & sendRequest path => friend?f= ??  
router.get('/',
    auth,
    validation(validitors.getRequest),
    friendController.getRequest
)

router.patch('/add',
    auth,
    validation(validitors.friend),
    friendController.addFriend
)

router.patch('/cancel',
    auth,
    validation(validitors.friend),
    friendController.cancelFriendRequest
)


router.patch('/accept',
    auth,
    validation(validitors.friend),
    friendController.acceptFriendRequest
)

router.patch('/reject',
    auth,
    validation(validitors.friend),
    friendController.rejectFriendRequest
)

router.patch('/unFriend',
    auth,
    validation(validitors.friend),
    friendController.unFriend
)


export default router