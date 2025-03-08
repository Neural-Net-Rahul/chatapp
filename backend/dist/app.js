"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const client_1 = require("@prisma/client");
const groupRoute_1 = __importDefault(require("./routes/groupRoute"));
const client = new client_1.PrismaClient();
exports.client = client;
const app = (0, express_1.default)();
exports.app = app;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use('/api/users', userRoute_1.default);
app.use("/api/groups", groupRoute_1.default);
