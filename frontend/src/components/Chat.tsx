import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { INITIAL_URL } from "../constant";
import { jwtDecode } from "jwt-decode";
import { useRef } from "react";
import socket from "../socket";

const Chat = () => {
    const {cId} = useParams();
    const [chat, setChat] = useState<any[]>([]);
    const [userData, setUserData] = useState<any[]>([]);
    const [userId, setUserId] = useState<any>(null);

    const [newMessage, setNewMessage] = useState("");
    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {   
        socket.on('send-message',(msg:any, user:any, roomId:any) => {
            if(Number(roomId) === Number(cId)){
                setChat((chat) => [...chat,{id:Date.now(), content:msg, type:"text",byWhichUser:user, groupId:cId}]);
            }
        })
        socket.on("save_chat_error", (msg) => {
          alert(msg);
        });
        return () => {
            socket.off('send-message');
            socket.off('save_chat_error');
        }
    },[])

    const sendMessage = () => {
        if(newMessage === ''){
            return;
        }
        socket.emit('message',newMessage, cId, userId);
        setNewMessage('');
    };

    useEffect(() => {
        const getChatData = async() => {
            const token = localStorage.getItem('token');
            const { id } = jwtDecode(token!) as {id:number};
            setUserId(id);
            const response = await axios.post(`${INITIAL_URL}/api/groups/getGroupData`, {
              token,
              groupId: Number(cId),
            });
            setChat(response.data.group.chat);
            setUserData(response.data.group.groupAndUser);
            socket.connect();
            socket.emit('join_render',Number(cId));
            // console.log(response.data.group.groupAndUser);
        }
        getChatData();
    },[])
    
    return (
      <div className="h-screen flex flex-col bg-gray-900 text-white">
        <div className="bg-gray-800 p-4 text-lg font-semibold text-center">
          Chat App
        </div>

        {/* Chat Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chat.map((c) => {
            const user = userData.find((u) => {
                return (Number(u.userId) === Number(c.byWhichUser))});
            const isMe = c.byWhichUser === Number(userId);

            return (
              <div
                key={c.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg shadow-md ${
                    isMe ? "bg-blue-500" : "bg-gray-700"
                  } text-white`}
                >
                  <span className="text-sm font-semibold">
                    {isMe ? "You" : user.user?.username || "Unknown"}
                  </span>
                  <p className="mt-1">{c.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={chatRef}></div>
        </div>

        <div className="bg-gray-800 p-4 flex">
          <input
            type="text"
            className="flex-1 p-2 bg-gray-700 text-white rounded-lg outline-none"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="ml-2 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    );
}

export default Chat;