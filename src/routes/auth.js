import express from "express";
import {accountLogin,sendCaptcha,verifyCaptcha,setPassword} from "../controllers/authController.js";
const router=express.Router();

router.post("/login",accountLogin);
router.post("/register/send-captcha",sendCaptcha);
router.post("/register/verify-captcha",verifyCaptcha)
router.post("/register/set-password",setPassword)
export default router;
