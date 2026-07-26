import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
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
    const { userName, email, password, fullname } = req.body
    if ([userName, email, password, fullname].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are Mandatory")
    }
    const ExistingUser = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (ExistingUser) {
        throw new ApiError("400", "User with the username or email all ready exist!")
    }
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    let avatar = "";
    if (avatarLocalPath) {
        const uploadResult = await FileUploadCloudinary(avatarLocalPath)
        avatar = uploadResult?.url || ""
    }
    const user = await User.create({
        userName: userName.toLowerCase(),
        email,
        password,
        fullname,
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
    const { userName, email, password } = req.body || {}

    if (!(userName || email)) {
        throw new ApiError(400, "All email/username are Mandatory")
    }

    const user = await User.findOne({
        $or: [{ email }, { userName: userName?.toLowerCase() }]
    })

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
    const { fullname, email } = req.body

    if (!fullname || !email) {
        throw new ApiError(400, "Fullname and Email are mandatory fields")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, { $set: { fullname, email } }, { new: true }).select("-password -refreshToken")

    return res
        .status(200)
        .json(new ApiResponce(200, user, "Account details updated successfully"));

})

const deleteUser = asyncHandler(async (req, res) => {
    const id = req.user?._id
    const user = await User.findById(id)
    if (!user) {
        throw new ApiError(404, "User not found!")
    }
    if (user._id.toString() !== req.user._id.toString()) {
        throw new ApiError(401, "Unauthorized!")
    }
    if (user.avatar) {
        await deleteFileOnCloudinary(user.avatar)
    }
    const DeleteUser = await User.findByIdAndDelete(id)
    return res
        .status(200)
        .json(new ApiResponce(200, DeleteUser, "User deleted successfully"));

}
)


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