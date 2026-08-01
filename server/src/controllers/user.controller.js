import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import Task from "../models/task.model.js"
import { FileUploadCloudinary, FileDeleteCloudinary, deleteFileOnCloudinary } from "../utils/cloudinary.js";
import ApiResponce from "../utils/ApiResponce.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const GenerateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.GenarateAccesstoken()
        const refreshToken = user.GenarateRefresh_token()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(400, "Error in generating Token, try again")
    }
}

const reqisterUser = asyncHandler(async (req, res, next) => {
    const { email, password, name } = req.body
    if ([email, password, name].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are Mandatory")
    }
    const ExistingUser = await User.findOne({ email })

    if (ExistingUser) {
        throw new ApiError(400, "User with this email already exists!")
    }
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    let avatar = "";
    if (avatarLocalPath) {
        const uploadResult = await FileUploadCloudinary(avatarLocalPath)
        avatar = uploadResult?.url || ""
    }
    const user = await User.create({
        email,
        password,
        name,
        avatar
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong")
    }

    return res.status(201).json(new ApiResponce(
        201,
        createdUser,
        "User registered successfully"
    ))

})

const loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body || {}

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required")
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const CorrectPassword = await user.isPassCorrect(password)

    if (!CorrectPassword) {
        throw new ApiError(401, "Invalid Credentials")
    }

    const { accessToken, refreshToken } = await GenerateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const option = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponce(
                {
                    loggedInUser, accessToken, refreshToken
                },
                200,
                "User logged in successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    try {
        await User.findOneAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1
                }
            }
        )

        const option = {
            httpOnly: true,
            secure: true
        }

        return res.status(200).clearCookie("accessToken", option)
            .clearCookie("refreshToken", option)
            .json(new ApiResponce(200, {}, "User logged out successfully"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong, Couldent logout")
    }

})

const RefreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const Raw_Incoming_Token = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(Raw_Incoming_Token?._id)

        if (!user) {
            throw new ApiError(404, "User not found!")
        }

        if (user?.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Invalid refresh token")
        }

        const { accessToken, refreshToken: newRefreshToken } = await GenerateAccessAndRefreshToken(user._id)

        const option = {
            httpOnly: true,
            secure: true
        }
        return res
            .status(200)
            .cookie("accessToken", accessToken, option)
            .cookie("refreshToken", newRefreshToken, option)
            .json(
                new ApiResponce(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Token refreshed successfully"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const Upadate_Password = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(404, "User not found!")
    }

    const CheckPassowrd = await user.isPassCorrect(oldPassword)

    if (!CheckPassowrd) {
        throw new ApiError(401, "Invalid Password!")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponce(200, {}, "Password changed successfully"))

})

const GetCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponce(
            200,
            req.user,
            "User fetched successfully"
        ))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { name, email } = req.body

    if (!name && !email) {
        throw new ApiError(400, "At least one field (name or email) must be provided to update")
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: updateFields },
        { new: true }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(new ApiResponce(200, user, "Account details updated successfully"));

})

const deleteUser = asyncHandler(async (req, res) => {
    console.log("DeleteUser Controller called!");
    console.log("req.user from verifyJWT:", req.user);

    // Fetch the full user document (including password) from the database
    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, "User not found!")
    }

    const password = req.body.password

    if (!password) {
        throw new ApiError(401, "Please provide password")
    }

    const isCorrectPassword = await user.isPassCorrect(password)

    if (!isCorrectPassword) {
        throw new ApiError(401, "Incorrect Password")
    }

    const id = user._id;
    console.log("Extracted User ID to delete:", id);

    // Safely trigger Cloudinary deletion in the background
    if (user.avatar) {
        deleteFileOnCloudinary(user.avatar).catch((err) => {
            console.error("Failed to delete user avatar on Cloudinary:", err);
        });
    }

    // Clean up all tasks owned by this user
    await Task.deleteMany({ owner: id });

    // Delete the user from the database
    const DeleteUser = await User.findByIdAndDelete(id)

    // Clear JWT authentication cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponce(200, DeleteUser, "User deleted successfully"));

})


export {
    reqisterUser,
    loginUser,
    logoutUser,
    RefreshAccessToken,
    Upadate_Password,
    GetCurrentUser,
    updateAccountDetails,
    deleteUser
}