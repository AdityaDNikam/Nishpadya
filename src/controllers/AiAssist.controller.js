import { asyncHandler } from "../utils/AsyncFunct.js"
import { generateGrokCompletion } from "../utils/GrokApiHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponce from "../utils/ApiResponce.js"

const getGrokResponse = asyncHandler(async (req, res) => {
    try {
        const { message } = req.body
        if (!message) {
            throw new ApiError(400, "Message is required")
        }
        const content = await generateGrokCompletion(message)
        return res.status(200).json(new ApiResponce(200, content, "Response from Grok"))
    } catch (error) {
        throw new ApiError(500, error.message, "Ai server error")
    }
})

export { getGrokResponse }