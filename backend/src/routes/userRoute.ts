import express from 'express'
import { getAllUsers, getUserData, login, register } from '../controllers/userController';
import { upload } from '../middlewares/multer';
import verify from '../middlewares/verifty';

const userRouter = express.Router();

userRouter.post('/login', login);
userRouter.post("/register",upload.fields([{name:'image', maxCount:1}]), register);
userRouter.post("/getUserData",verify, getUserData);
userRouter.get("/getAllUsers", getAllUsers);


export default userRouter;