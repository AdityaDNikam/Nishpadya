import { asyncHandler } from "../utils/AsyncFunct.js";
import ApiError from "../utils/ApiError.js";
import ApiResponce from "../utils/ApiResponce.js";
import jwt from "jsonwebtoken"
import Task from "../models/task.model.js"

const GetCurrentToDo = asyncHandler(async (req, res, next) => {
    try {
        const ToDoId = req.params.id

        const ToDo = await Task.findById(ToDoId)
        if (!ToDo) {
            throw new ApiError(404, "ToDo not found")
        }
        req.user = ToDo.owner
        req.ToDo = ToDo
        next()
    } catch (error) {
        throw new ApiError(401, "Invalid ToDo Id")
    }
})

export { GetCurrentToDo }