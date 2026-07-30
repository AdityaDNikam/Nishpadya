import {
    reqisterUser,
    loginUser,
    logoutUser,
    RefreshAccessToken,
    Upadate_Password,
    GetCurrentUser,
    updateAccountDetails,
    deleteUser
} from "../controllers/user.controller.js";
import { Router } from "express";
import { upload } from "../middleware/multer.js";
import { verifyJWT } from "../middleware/auth-jwt.js";

const router = Router();

//create user
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    reqisterUser
);

//login user
router.route("/login").post(loginUser);

//logout user
router.route("/logout").post(verifyJWT, logoutUser);

//refresh access token
router.route("/refreshAccessToken").post(RefreshAccessToken);

//update password
router.route("/updatePassword").post(verifyJWT, Upadate_Password);

//get current user
router.route("/getCurrentUser").post(verifyJWT, GetCurrentUser);

//update account details
router.route("/updateAccountDetails").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    verifyJWT,
    updateAccountDetails
);

//delete user
router.route("/deleteUser").post(verifyJWT, deleteUser);

export default router;