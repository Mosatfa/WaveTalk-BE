import * as groupController from './controller/group.js'
// import * as validitors from './friend.validation.js'
// import { validation } from '../../middleware/validation.js';
import { auth } from '../../middleware/auth.js';
import { Router } from 'express';



const router = Router();

// get groups
router.get('/',
    auth,
    groupController.getGroup
)

// create group
router.post('/create',
    auth,
    groupController.createGroup
)

// add member & remove
router.patch('/add/:groupAdminId',
    auth,
    groupController.addMember
)
router.patch('/remove/:groupAdminId',
    auth,
    groupController.removeMember
)

// admin add & remove
router.patch('/admin/:groupAdminId/add',
    auth,
    groupController.addAdmin
)
router.patch('/admin/:groupAdminId/remove',
    auth,
    groupController.removeAdmin
)

// leave group
router.patch('/:groupId/leave',
    auth,
    groupController.leaveGroup
)

// update name, description and picture
router.put('/update/:groupAdminId',
    auth,
    groupController.updateGroup
)

// send message to group
router.post('/sendMessage/:groupId',
    auth,
    groupController.sendMessageToGroup
)



export default router
