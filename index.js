import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
//set directory dirname 
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, './config/.env') })

import express from 'express'
import initApp from './src/index.router.js'
import { initIo } from './src/utils/server.js'
import userModel from './DB/model/User.model.js'
import { socketAuth } from './src/middleware/auth.js'
import messageModel from './DB/model/Message.mode.js'
const app = express()

// setup port and the baseUrl
const port = process.env.PORT || 5000


initApp(app, express)


const httpServer = app.listen(port, () => console.log(`Example app listening on port ${port}!`))

const io = initIo(httpServer)

// update socketId
io.on('connection', (socket) => {
    // console.log('a user connected');
    let userId;
    socket.on("updateSocketId", async (data) => {
        // console.log(socket.id);
        const { _id } = await socketAuth(data.token, socket.id)
        userId = _id
        if (_id) {
            await userModel.findByIdAndUpdate({ _id }, { socketId: socket.id, status: "online" })
            await messageModel.findByIdAndUpdate({ recipient: _id }, { status: "Delivered" })
            socket.emit("updateSocketId", "Done")
            socket.broadcast.emit('getOnline', { _id })
        }
    })

    socket.on('messageSeen', async (data) => {
        const { messageId, recipientId } = data;

        await messageModel.findByIdAndUpdate(messageId, {
            status: "Seen",
        });

        socket.broadcast.to(senderSocketId).emit('messageSeen', { messageId, recipientId });
    });

    socket.on('disconnect', async () => {
        // console.log('user disconnected');
        if (userId) {
            await userModel.findByIdAndUpdate({ _id: userId }, { status: "offline" })
            socket.broadcast.emit('getOffline', userId)
        }
    });
    
})






