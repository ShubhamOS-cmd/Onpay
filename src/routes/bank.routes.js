import { Router } from "express"
import { registerUser } from "../controllers/bank.controllers.js";
const router = Router();

router.route("/register").post(registerUser);

export default router