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
router.route("/updateTask/:taskId").patch(verifyJWT, updateTask)

//delete task
router.route("/deleteTask/:taskId").delete(verifyJWT, deleteTask)

//get task
router.route("/getTask").get(verifyJWT, getTask)

//get task by id
router.route("/getTaskById/:taskId").get(verifyJWT, getTaskById)

//get ai assist by taskId
router.route("/assist/:taskId").post(verifyJWT, getAiAssist);


export default router;