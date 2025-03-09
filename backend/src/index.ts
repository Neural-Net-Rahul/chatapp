import {app} from "./app";
import dotenv from 'dotenv'
import http from 'http'
import { Server } from 'socket.io'
import { createGroup, joinGroup, joinOtherGroup, rejectGroup, saveChat } from "./controllers/GroupController";

dotenv.config();

const server = http.createServer(app);
const io = new Server(server,{
    cors : {
        origin : 'http://localhost:5173'
    }
});

io.on('connection',(socket)=> {
    console.log("User Connected!!!",socket.id);

    socket.on('group_creation',async(groupMembersId,groupName,groupDescription, adminId, isPrivate)=>{
        const data = await createGroup(groupMembersId, groupName, groupDescription, adminId, isPrivate);
        if(data.status != 200){
            socket.emit('group_creation_error',"Error while creating group");
        }
        else{
            socket.join(String(data.id));
        }
    }) 
    socket.on('join_group',async(userId, groupId) => {
        const data = await joinGroup(userId,groupId);
        if (data.status != 200) {
          socket.emit("join_group_error", "Error while joining");
        }
        else{
            socket.join(String(groupId));
        }
    })

    socket.on("join_other_group", async (userId, groupId) => {
      const data = await joinOtherGroup(userId, groupId);
      if (data.status != 200) {
        socket.emit("join_group_error", "Error while joining");
      } else {
        socket.join(String(groupId));
      }
    });

    socket.on('join_render',(id) => {
        console.log("Joining takes place");
        console.log("roomId : ", id, " socketId: ", socket.id);
        socket.join(String(id));
    })

    socket.on('reject_group',async(userId, groupId)=>{
        const data = await rejectGroup(userId, groupId);
        if (data.status != 200) {
          socket.emit("reject_group_error", "Error while rejecting");
        }
    })

    socket.on('message',async(msg, roomId, byWhichUser)=>{
        console.log("roomId ",roomId);
        console.log("rooms: ", io.sockets.adapter.rooms.get(roomId));
        io.to(roomId).emit('send-message',msg, byWhichUser, roomId);
        const msgg = await saveChat(String(msg), "text", byWhichUser, roomId, false);
        if(msgg.status != 200){
            socket.emit("save_chat_error", "Error while saving chat");
        }
    })

    socket.on('disconnect',() => {
        console.log("User disconnected!!!",socket.id);
    })
})

const PORT = process.env.PORT || 3001;

server.listen(PORT , () => {console.log(`Server connected to port ${PORT}`)});
