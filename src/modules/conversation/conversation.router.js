import * as conversationController from './controller/conversation.js'
import * as validitors from './conversation.validation.js'
import { validation } from '../../middleware/validation.js';
import { auth } from '../../middleware/auth.js';


import { Router } from 'express';



const router = Router();

router.get('/',
    auth,
    conversationController.getAllConversations
)

router.get('/getMessages',
    auth,
    validation(validitors.getMessage),
    conversationController.getMessagesCoversation
)

router.post('/sendMessage',
    auth,
    validation(validitors.sendMessage),
    conversationController.sendMessage
)




export default router