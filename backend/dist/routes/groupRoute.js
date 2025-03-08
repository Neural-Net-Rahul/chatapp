"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifty_1 = __importDefault(require("../middlewares/verifty"));
const GroupController_1 = require("../controllers/GroupController");
const groupRouter = express_1.default.Router();
groupRouter.post('/getAllGroups', verifty_1.default, GroupController_1.getAllGroups);
exports.default = groupRouter;
