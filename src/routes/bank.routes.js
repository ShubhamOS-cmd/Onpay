import { Router } from "express"
import { registerUser,
    depositMoney
 } from "../controllers/bank.controllers.js";
const router = Router();

router.route("/register").post(registerUser);
router.route("/deposit").post(depositMoney);

export default router