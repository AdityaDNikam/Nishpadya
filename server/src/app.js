import cors from "cors"
import cookieParser from "cookie-parser"
import express, { urlencoded } from "express"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json())
app.use(urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieParser())

app.get("/api/v1/health-check", (req, res) => {
    res.json({ message: "Backend connection successful!" })
})

import userRouter from "./routes/user.router.js"
import taskRouter from "./routes/task.router.js"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/task", taskRouter)

// Global error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.error || []
    });
});

export default app;
