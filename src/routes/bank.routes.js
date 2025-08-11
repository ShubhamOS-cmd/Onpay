import { Router } from "express"
import { registerUser,
    depositMoney,
    fetchBalance,
    debitMoney,
    sendMoney,
    updateAccount
 } from "../controllers/bank.controllers.js";
const router = Router();

router.route("/register").post(registerUser);
router.route("/deposit").post(depositMoney);
router.route("/Balance").post(fetchBalance);
router.route("/debitMoney").post(debitMoney);
router.route("/sendMoney").post(sendMoney);
router.route("/updateAccount").post(updateAccount);
export default router