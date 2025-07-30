import { Router } from "express";
import { registerAccount } from "../controllers/bank.controllers.js";
const router = Router();


router.route("/register").post(registerAccount);


export default router