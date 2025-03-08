import { Request, Response, RequestHandler } from "express";
import bcrypt from 'bcryptjs'
import {client} from '../app'
import jwt from 'jsonwebtoken'
import { uploadOnCloudinary } from "../utils/cloudinary";

interface ExtendedRequest extends Request {
    files : any
}

const generateToken = (id:any) => {
    const token = jwt.sign({id},process.env.TOKEN_SECRET!);
    return token;
}

const login : RequestHandler = async(req:Request,res:Response):Promise<any> => {
    try{
        const {email, password} = req.body;
        const user = await client.user.findFirst({
            where:{
                email
            }
        })
        if(!user){
            return res.status(501).json({message:"Email does not exist"});
        }
        const same = await bcrypt.compare(password,user.password);
        if(!same){
            return res.status(502).json({ message: "Password is incorrect" });
        }
        await client.user.update({
            where:{
                id:user.id
            },
            data:{
                online:true
            }
        })
        const token = generateToken(user.id);
        return res.status(200).json({message:"User logged in successfully",token,id:user.id});
    }
    catch(e){
        return res.status(503).json({message:"Some error occurred"});
    }
}

const register:RequestHandler = async(req,res):Promise<void> => {
    try{
        const {username, email, password} = req.body;
        const user = await client.user.findFirst({
            where:{
                email
            }
        })
        if(user){
            res.status(501).json({message:"User already exists"});
            return;
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const imagePath = (req as ExtendedRequest)?.files?.image?.[0]?.path || '';
        let cloudinaryUrl = '';
        if(imagePath){
            const image = await uploadOnCloudinary(imagePath);
            cloudinaryUrl = image?.url!;
        }
        const newUser = await client.user.create({
            data:{
                username,email,password:hashedPassword,online:true, lastSeenOnline:new Date(), profilePic:cloudinaryUrl
            }
        })
        const token = generateToken(newUser.id);
        res.status(200).json({message:
            "User registered successfully",token, id:newUser.id
        });
        return;
    }
    catch(e){
        res.status(500).json({message:"Some error occurred"});
        return;
    }
}

const getUserData:RequestHandler = async(req:Request,res:Response):Promise<void> => {
    try{
        const {userId} = req.body;
        const user = await client.user.findFirst({
            where:{
                id:userId
            },
            include:{
                groupAndUser:{
                    include:{
                        group:true
                    }
                },
                groupJoiningReq:{
                    include:{
                        group:true
                    }
                }
            }
        })
        res.status(200).json({message:"Sending user data...",user});
        return;
    }
    catch(e){
        res.status(500).json({message:"Error while returning user data"});
        return;
    }
}

const getAllUsers:RequestHandler = async(req:Request,res:Response):Promise<void> => {
    try{
        const allUsers = await client.user.findMany();
        res.status(200).json({message:"Sending all user data...",allUsers});
        return;
    }catch(e){
        res.status(500).json({message:"Error while retrieving all users data"});
        return;
    }
}

export {login, register ,getUserData, getAllUsers}