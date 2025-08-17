import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { registerUser,
    loginUser,
    logOutUser
 } from "../controllers/user.controllers.js";
 import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.single("avatar"),
    registerUser
);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT , logOutUser);

export default router