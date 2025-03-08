"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const GroupController_1 = require("./controllers/GroupController");
dotenv_1.default.config();
const server = http_1.default.createServer(app_1.app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: 'http://localhost:5173'
    }
});
io.on('connection', (socket) => {
    console.log("User Connected!!!", socket.id);
    socket.on('group_creation', (groupMembersId, groupName, groupDescription, adminId, isPrivate) => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield (0, GroupController_1.createGroup)(groupMembersId, groupName, groupDescription, adminId, isPrivate);
        if (data.status != 200) {
            socket.emit('group_creation_error', "Error while creating group");
        }
        else {
            socket.join(String(data.id));
        }
    }));
    socket.on('join_group', (userId, groupId) => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield (0, GroupController_1.joinGroup)(userId, groupId);
        if (data.status != 200) {
            socket.emit("join_group_error", "Error while joining");
        }
        else {
            socket.join(String(groupId));
        }
    }));
    socket.on("join_other_group", (userId, groupId) => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield (0, GroupController_1.joinOtherGroup)(userId, groupId);
        if (data.status != 200) {
            socket.emit("join_group_error", "Error while joining");
        }
        else {
            socket.join(String(groupId));
        }
    }));
    socket.on('join_render', (id) => {
        console.log("Joining takes place");
        socket.join(String(id));
    });
    socket.on('reject_group', (userId, groupId) => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield (0, GroupController_1.rejectGroup)(userId, groupId);
        if (data.status != 200) {
            socket.emit("reject_group_error", "Error while rejecting");
        }
    }));
    socket.on('message', (data) => {
        console.log(data);
    });
    socket.on('disconnect', () => {
        console.log("User disconnected!!!", socket.id);
    });
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => { console.log(`Server connected to port ${PORT}`); });
