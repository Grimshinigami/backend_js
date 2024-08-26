import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        }
    ]),
    registerUser
)

router.route('/login').post(loginUser)

//secured routes

router.route("/logout").post(verifyJWT, logoutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route("/changepassword").post(verifyJWT, changeCurrentPassword)
router.route("/getuser").post(verifyJWT, getCurrentUser)
router.route("/updatedetails").post(verifyJWT, updateAccountDetails)
router.route("/updateavatar").post(verifyJWT, updateUserAvatar)
router.route("/updatecover").post(verifyJWT, updateUserCoverImage)

export default router