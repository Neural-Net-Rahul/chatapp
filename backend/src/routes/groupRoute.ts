import express from 'express'
import verify from '../middlewares/verifty';
import { getAllGroups, getGroupData } from '../controllers/GroupController';

const groupRouter = express.Router();
groupRouter.post('/getAllGroups',verify,getAllGroups);
groupRouter.post("/getGroupData", getGroupData);


export default groupRouter;