import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config()

const Client = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai/"
}
)

const generateGrokCompletion = async (message) => {
    const response = await Client.chat.completions.create({
        model: "gemini-3.5-flash-lite",
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
    console.log(response.choices[0].message.content)
    return response.choices[0].message.content
}

export { Client, generateGrokCompletion }