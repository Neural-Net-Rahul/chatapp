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
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinOtherGroup = exports.rejectGroup = exports.joinGroup = exports.createGroup = exports.getAllGroups = void 0;
const app_1 = require("../app");
const getAllGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { userId } = req.body;
        userId = Number(userId);
        let allGroups = yield app_1.client.groupAndUser.findMany({
            where: {
                userId: {
                    not: userId
                }
            },
            include: {
                group: true
            }
        });
        const myGroups = yield app_1.client.groupAndUser.findMany({
            where: {
                userId
            }
        });
        const allGroupIds = myGroups.map((obj) => obj.groupId);
        allGroups = allGroups.filter((obj) => !allGroupIds.includes(obj.groupId));
        let grps = [];
        let allGrps = [];
        for (let i = 0; i < allGroups.length; i++) {
            const obj = allGroups[i];
            if (!grps.includes(obj.groupId)) {
                allGrps.push(allGroups[i]);
                grps.push(obj.groupId);
            }
        }
        allGroups = allGrps;
        res.status(200).json({ message: "Sending all data...", allGroups });
        return;
    }
    catch (e) {
        res.status(500).json({ message: "Error while retrieving all groups" });
        return;
    }
});
exports.getAllGroups = getAllGroups;
const createGroup = (groupMembersId, groupName, groupDescription, adminId, isPrivate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const group = yield app_1.client.group.create({
            data: {
                name: groupName,
                isPrivate,
                groupSize: 1,
                description: groupDescription,
            },
        });
        const groupId = group.id;
        yield app_1.client.groupAndUser.create({
            data: {
                userId: adminId,
                groupId: groupId,
                admin: true,
            },
        });
        yield app_1.client.groupJoiningRequest.createMany({
            data: groupMembersId
                .filter((userId) => userId !== adminId)
                .map((userId) => ({
                userId,
                groupId,
                initiatorId: -1,
                status: "PENDING",
            })),
        });
        return { status: 200, message: "Successful", id: group.id };
    }
    catch (e) {
        return { status: 500, message: "Error" };
    }
});
exports.createGroup = createGroup;
const joinGroup = (userId, groupId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield app_1.client.groupAndUser.create({
            data: {
                userId, groupId, admin: false
            }
        });
        yield app_1.client.groupJoiningRequest.update({
            where: {
                userId_groupId: {
                    userId, groupId
                }
            },
            data: {
                status: 'ACCEPTED'
            }
        });
        yield app_1.client.group.update({
            where: {
                id: groupId
            },
            data: {
                groupSize: {
                    increment: 1
                }
            }
        });
        return { status: 200, message: "Successful" };
    }
    catch (e) {
        return { status: 500, message: "Error" };
    }
});
exports.joinGroup = joinGroup;
const joinOtherGroup = (userId, groupId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield app_1.client.groupAndUser.create({
            data: {
                userId,
                groupId,
                admin: false,
            },
        });
        yield app_1.client.group.update({
            where: {
                id: groupId,
            },
            data: {
                groupSize: {
                    increment: 1,
                },
            },
        });
        return { status: 200, message: "Successful" };
    }
    catch (e) {
        return { status: 500, message: "Error" };
    }
});
exports.joinOtherGroup = joinOtherGroup;
const rejectGroup = (userId, groupId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield app_1.client.groupJoiningRequest.update({
            where: {
                userId_groupId: {
                    userId,
                    groupId,
                },
            },
            data: {
                status: "REJECTED",
            },
        });
        return { status: 200, message: "Successful" };
    }
    catch (e) {
        return { status: 500, message: "Error" };
    }
});
exports.rejectGroup = rejectGroup;
