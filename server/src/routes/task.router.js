import { Router } from "express";
import { upload } from "../middleware/multer.js";
import { verifyJWT } from "../middleware/auth-jwt.js";
import {
    createTask,
    getTask,
    getTaskById,
    updateTask,
    deleteTask,
    getAiAssist
} from "../controllers/task.controller.js";
import { getGrokResponse } from "../controllers/AiAssist.controller.js";

const router = Router();

//create task
router.route("/createTask").post(verifyJWT, createTask)

//update task
router.route("/updateTask").post(verifyJWT, updateTask)

//delete task
router.route("/deleteTask").post(verifyJWT, deleteTask)

//get task
router.route("/getTask").post(verifyJWT, getTask)

//get task by id
router.route("/getTaskById").post(verifyJWT, getTaskById)

//get general ai assist
router.route("/assist").post(verifyJWT, getGrokResponse);

//get ai assist by taskId
router.route("/assist/:taskId").post(verifyJWT, getAiAssist);


export default router;