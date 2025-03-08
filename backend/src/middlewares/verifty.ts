import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const verify = async(req:Request,res:Response,next:NextFunction) => {
    try{    
        let {token, userId} = req.body;
        userId = Number(userId);
        const data = (await jwt.verify(token, process.env.TOKEN_SECRET!)) as {id : number};
        if(!data || data.id != userId){
            res.status(505).json({ message: "Either token is not verified or userId is not in token" });
            return;
        }
        next();
    }
    catch(e){   
        res.status(505).json({message:"Some error occurred"});
        return;
    }
}

export default verify;