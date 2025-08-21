import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { registerUser,
    loginUser,
    logOutUser,
    refreshTokenAccessToken,
    changePassPin,
    updateAccountDetails,
    updateAvatar
 } from "../controllers/user.controllers.js";

 import { paymentThroughPhoneNo,
    paymentThroughAccountNo,
    AccountBalance
 } from "../controllers/payment.controller.js"; 

import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
    upload.single("avatar"),
    registerUser
);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT , logOutUser);
router.route("/refreshMe").post(refreshTokenAccessToken);
router.route("/changePassPin").post(verifyJWT , changePassPin);
router.route("/updateAccount").post(verifyJWT , updateAccountDetails);
router.route("/updateAvatar").post(verifyJWT , upload.single("avatar"),updateAvatar);
router.route("/sendviaPhoneNo").post(verifyJWT , paymentThroughPhoneNo );
router.route("/sendviaAccountNo").post(verifyJWT , paymentThroughAccountNo);
router.route("AccountBalance").post(verifyJWT , AccountBalance);
export default router