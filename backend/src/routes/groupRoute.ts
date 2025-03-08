import express from 'express'
import verify from '../middlewares/verifty';
import { getAllGroups } from '../controllers/GroupController';

const groupRouter = express.Router();
groupRouter.post('/getAllGroups',verify,getAllGroups);

export default groupRouter;