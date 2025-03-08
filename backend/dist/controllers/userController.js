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
exports.getAllUsers = exports.getUserData = exports.register = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const app_1 = require("../app");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cloudinary_1 = require("../utils/cloudinary");
const generateToken = (id) => {
    const token = jsonwebtoken_1.default.sign({ id }, process.env.TOKEN_SECRET);
    return token;
};
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield app_1.client.user.findFirst({
            where: {
                email
            }
        });
        if (!user) {
            return res.status(501).json({ message: "Email does not exist" });
        }
        const same = yield bcryptjs_1.default.compare(password, user.password);
        if (!same) {
            return res.status(502).json({ message: "Password is incorrect" });
        }
        yield app_1.client.user.update({
            where: {
                id: user.id
            },
            data: {
                online: true
            }
        });
        const token = generateToken(user.id);
        return res.status(200).json({ message: "User logged in successfully", token, id: user.id });
    }
    catch (e) {
        return res.status(503).json({ message: "Some error occurred" });
    }
});
exports.login = login;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { username, email, password } = req.body;
        const user = yield app_1.client.user.findFirst({
            where: {
                email
            }
        });
        if (user) {
            res.status(501).json({ message: "User already exists" });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const imagePath = ((_c = (_b = (_a = req === null || req === void 0 ? void 0 : req.files) === null || _a === void 0 ? void 0 : _a.image) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.path) || '';
        let cloudinaryUrl = '';
        if (imagePath) {
            const image = yield (0, cloudinary_1.uploadOnCloudinary)(imagePath);
            cloudinaryUrl = image === null || image === void 0 ? void 0 : image.url;
        }
        const newUser = yield app_1.client.user.create({
            data: {
                username, email, password: hashedPassword, online: true, lastSeenOnline: new Date(), profilePic: cloudinaryUrl
            }
        });
        const token = generateToken(newUser.id);
        res.status(200).json({ message: "User registered successfully", token, id: newUser.id
        });
        return;
    }
    catch (e) {
        res.status(500).json({ message: "Some error occurred" });
        return;
    }
});
exports.register = register;
const getUserData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const user = yield app_1.client.user.findFirst({
            where: {
                id: userId
            },
            include: {
                groupAndUser: {
                    include: {
                        group: true
                    }
                },
                groupJoiningReq: {
                    include: {
                        group: true
                    }
                }
            }
        });
        res.status(200).json({ message: "Sending user data...", user });
        return;
    }
    catch (e) {
        res.status(500).json({ message: "Error while returning user data" });
        return;
    }
});
exports.getUserData = getUserData;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allUsers = yield app_1.client.user.findMany();
        res.status(200).json({ message: "Sending all user data...", allUsers });
        return;
    }
    catch (e) {
        res.status(500).json({ message: "Error while retrieving all users data" });
        return;
    }
});
exports.getAllUsers = getAllUsers;
