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
    const { title, description, status, dueDate, priority, aiAssist } = req.body
    const user = req.user

    const task = await Task.findById(taskId)
    if (!task) {
        throw new ApiError(404, "Task not found")
    }
    if (task.owner.toString() !== user._id.toString()) {
        throw new ApiError(401, "Unauthorized")
    }

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (status !== undefined) updateFields.status = status;
    if (dueDate !== undefined) updateFields.dueDate = dueDate;
    if (priority !== undefined) updateFields.priority = priority;
    if (aiAssist !== undefined) updateFields.aiAssist = aiAssist;

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateFields, { new: true })

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

// In-memory rate limiting store for /assist/:taskId
const aiAssistCallLog = new Map();
const EIGHTEEN_HOURS_MS = 18 * 60 * 60 * 1000;
const MAX_FREE_CALLS = 5;

const getAiAssist = asyncHandler(async (req, res) => {
    const { taskId } = req.params
    if (!taskId) {
        throw new ApiError(400, "Task id is required")
    }
    const task = await Task.findById(taskId)
    if (!task) {
        throw new ApiError(404, "Task not found")
    }

    const key = `${req.user?._id || 'user'}_${taskId}`;
    const now = Date.now();
    let timestamps = aiAssistCallLog.get(key) || [];

    // Filter out timestamps older than 18 hours
    timestamps = timestamps.filter(ts => (now - ts) < EIGHTEEN_HOURS_MS);

    if (timestamps.length >= MAX_FREE_CALLS) {
        const firstCallTime = timestamps[0];
        if ((now - firstCallTime) < EIGHTEEN_HOURS_MS) {
            throw new ApiError(
                400, 
                "Total number of free AI assists exhausted. Please upgrade to a premium plan or wait for 18 hours."
            );
        }
    }

    const { previousAiResponse, userSpecification } = req.body || {};

    let message = `Task Title: ${task.title}\nTask Details: ${task.description}`;
    if (previousAiResponse) {
        message += `\nPrevious AI Response: ${previousAiResponse}`;
    }
    if (userSpecification) {
        message += `\nUser Input / Specification: ${userSpecification}`;
    }

    const AiAssist = await generateGrokCompletion(message);

    // Record timestamp of successful call
    timestamps.push(now);
    aiAssistCallLog.set(key, timestamps);

    const remainingCalls = Math.max(0, MAX_FREE_CALLS - timestamps.length);

    return res.status(200).json(
        new ApiResponce(
            200, 
            { AiAssist, remainingCalls }, 
            `Ai Assistance fetched successfully. ${remainingCalls} AI calls are left.`
        )
    )
})

export {
    createTask,
    getTask,
    getTaskById,
    updateTask,
    deleteTask,
    getAiAssist
}
