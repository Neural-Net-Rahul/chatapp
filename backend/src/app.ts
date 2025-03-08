import express from 'express'
import cors from 'cors'
import userRouter from './routes/userRoute';
import { PrismaClient } from '@prisma/client';
import groupRouter from './routes/groupRoute';
const client = new PrismaClient();

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/users',userRouter);
app.use("/api/groups", groupRouter);

export {app, client};