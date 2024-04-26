import connectDB from '../DB/connection.js'
import authRouter from './modules/auth/auth.router.js'
import userRouter from './modules/user/user.router.js'
import conversation from './modules/conversation/conversation.router.js'
import friendRouter from './modules/friend/friend.router.js'
import groupRouter from './modules/group/group.router.js'





import { gloablErrorHandling } from './utils/errorHandling.js'
import cors from 'cors'


const initApp = (app, express) => {

    //convert Buffer Data
    app.use(express.json({}))
    app.use(cors())

    //Setup API Routing 
    app.use('/auth', authRouter)
    app.use('/user', userRouter)
    app.use('/friend', friendRouter)
    app.use('/conve', conversation)
    app.use('/group', groupRouter)




    app.all('*', (req, res, next) => {
        res.send("In-valid Routing Plz check url  or  method")
    })

    // Gloable Error Handling
    app.use(gloablErrorHandling)
    // Connected DB
    connectDB()

}



export default initApp