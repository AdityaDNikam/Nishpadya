import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config()

const xai = new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: process.env.XAI_BASE_URL || "https://api.x.ai/v1"
}
)

const generateGrokCompletion = async (message) => {
    const response = await xai.chat.completions.create({
        model: "grok-4",
        messages: [
            {
                role: "system",
                content: `You are a expert consultant, give your best 
                    help with the follow task and respond in no more than 3 bullet points 
                    in a short and concise sentance with now more than 25 words `
            },
            {
                role: "user",
                content: message
            }
        ]
    })
    return response.choices[0].message.content
}

export { xai, generateGrokCompletion }