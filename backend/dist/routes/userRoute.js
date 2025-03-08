"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const multer_1 = require("../middlewares/multer");
const verifty_1 = __importDefault(require("../middlewares/verifty"));
const userRouter = express_1.default.Router();
userRouter.post('/login', userController_1.login);
userRouter.post("/register", multer_1.upload.fields([{ name: 'image', maxCount: 1 }]), userController_1.register);
userRouter.post("/getUserData", verifty_1.default, userController_1.getUserData);
userRouter.get("/getAllUsers", userController_1.getAllUsers);
exports.default = userRouter;
