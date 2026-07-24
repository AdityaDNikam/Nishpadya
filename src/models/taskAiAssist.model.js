import mongoose, { Schema } from "mongoose";

const AiAssistSchema = new Schema({
    ToDo_item: {
        type: String,
        required: true
    },
    Context: {
        type: Schema.Types.ObjectId,
        ref: "Task"
    },
    aiAssist: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const AiAssist = mongoose.model("AiAssist", AiAssistSchema);