import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponce from "../utils/ApiResponce.js"
import Task from "../models/task.model.js"
import { generateGrokCompletion } from "../utils/GrokApiHandler.js"

// create Task
const createTask = asyncHandler(async (req, res) => {
    const user = req.user
    const { title, description, status, dueDate, priority } = req.body

    if (!dueDate) {
        throw new ApiError(400, "Due date is required")
    }

    const task = await Task.create({
        title,
        description,
        status,
        priority,
        dueDate,
        owner: user._id
    })
    return res.status(201).json(new ApiResponce(201, task, "Task created successfully"))
})

// update task

const updateTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params
    const { title, description, status, dueDate, priority } = req.body
    const user = req.user

    const task = await Task.findById(taskId)
    if (!task) {
        throw new ApiError(404, "Task not found")
    }
    if (task.owner.toString() !== user._id.toString()) {
        throw new ApiError(401, "Unauthorized")
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, {
        title,
        description,
        status,
        dueDate,
        priority
    }, { new: true })

    return res.status(200).json(new ApiResponce(200, updatedTask, "Task updated successfully"))
})

//delete a task
const deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params
    const user = req.user
    const task = await Task.findById(taskId)
    if (!task) {
        throw new ApiError(404, "Task not found")
    }
    if (task.owner.toString() !== user._id.toString()) {
        throw new ApiError(401, "Unauthorized")
    }
    await Task.findByIdAndDelete(taskId)
    return res.status(200).json(new ApiResponce(200, "Task deleted successfully"))
})

// get user created tasks
const getTask = asyncHandler(async (req, res) => {
    const user = req.user
    const tasks = await Task.find({ owner: user._id })
    if (!tasks || tasks.length === 0) {
        throw new ApiError(404, "No tasks found")
    }
    return res.status(200).json(new ApiResponce(200, tasks, "Tasks fetched successfully"))
})

//get task by id
const getTaskById = asyncHandler(async (req, res) => {
    const { taskId } = req.params
    const user = req.user
    const task = await Task.findById(taskId)
    if (!task) {
        throw new ApiError(404, "Task not found")
    }
    if (task.owner.toString() !== user._id.toString()) {
        throw new ApiError(401, "Unauthorized")
    }
    return res.status(200).json(new ApiResponce(200, task, "Task fetched successfully"))
})

const getAiAssist = asyncHandler(async (req, res) => {
    const { taskId } = req.params
    if (!taskId) {
        throw new ApiError(400, "Task id is required")
    }
    const task = await Task.findById(taskId)
    if (!task) {
        throw new ApiError(404, "Task not found")
    }

    const message = `Task Title: ${task.title}\nTask Description: ${task.description}`;
    const AiAssist = await generateGrokCompletion(message);

    return res.status(200).json(new ApiResponce(200, AiAssist, "Ai Assistance fetched successfully"))
})

export {
    createTask,
    getTask,
    getTaskById,
    updateTask,
    deleteTask,
    getAiAssist
}
