import { RequestHandler, Request, Response } from "express";
import { client } from "../app";

const getAllGroups:RequestHandler = async(req:Request,res:Response):Promise<void> => {
    try{
        let { userId } = req.body;
        userId = Number(userId);
        let allGroups = await client.groupAndUser.findMany({
            where:{
                userId:{
                    not: userId
                }
            },
            include:{
                group:true
            }
        })
        const myGroups = await client.groupAndUser.findMany({
          where:{
            userId
          }
        })
        const allGroupIds =  myGroups.map((obj)=> obj.groupId);
        allGroups = allGroups.filter((obj) => !allGroupIds.includes(obj.groupId));
        let grps:any = []
        let allGrps:any = [];
        for(let i = 0;i<allGroups.length;i++){
          const obj = allGroups[i];
          if(!grps.includes(obj.groupId)){
            allGrps.push(allGroups[i]);
            grps.push(obj.groupId);
          }
        }
        allGroups = allGrps;
        res.status(200).json({message:"Sending all data...",allGroups});
        return;
    }
    catch(e){
        res.status(500).json({message:"Error while retrieving all groups"});
        return;
    } 
}

const createGroup = async (
  groupMembersId:any,
  groupName:any,
  groupDescription:any,
  adminId:any,
  isPrivate:any
) => {
  try {
    const group = await client.group.create({
      data: {
        name: groupName,
        isPrivate,
        groupSize: 1,
        description: groupDescription,
      },
    });

    const groupId = group.id;

    await client.groupAndUser.create({
      data: {
        userId: adminId,
        groupId: groupId,
        admin: true,
      },
    });

    await client.groupJoiningRequest.createMany({
      data: groupMembersId
        .filter((userId:any) => userId !== adminId)
        .map((userId: Number) => ({
          userId,
          groupId,
          initiatorId: -1,
          status: "PENDING",
        })),
    });
    return {status:200, message:"Successful", id:group.id};
  } catch (e) {
    return {status:500, message:"Error"};
  }
};

const joinGroup = async(userId:any, groupId:any) => {
    try{
        await client.groupAndUser.create({
            data:{
                userId, groupId, admin:false
            }
        })
        await client.groupJoiningRequest.update({
            where:{
                userId_groupId:{
                    userId, groupId
                }
            },
            data:{
                status : 'ACCEPTED'
            }
        })
        await client.group.update({
          where:{
            id:groupId
          },
          data:{
            groupSize: {
              increment: 1
            }
          }
        })
        return { status: 200, message: "Successful" };
    }
    catch(e){
        return { status: 500, message: "Error" };
    }
}

const joinOtherGroup = async (userId: any, groupId: any) => {
  try {

    await client.groupAndUser.create({
      data: {
        userId,
        groupId,
        admin: false,
      },
    });


    await client.group.update({
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
  } catch (e) {
    return { status: 500, message: "Error" };
  }
};

const rejectGroup = async(userId:any, groupId:any) => {
    try{
        await client.groupJoiningRequest.update({
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
    catch(e){
        return { status: 500, message: "Error" };
    }
}

export {getAllGroups, createGroup, joinGroup, rejectGroup, joinOtherGroup};