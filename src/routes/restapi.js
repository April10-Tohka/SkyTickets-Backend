import express from "express";
import {getSearchBoxRecommend} from "../controllers/restapiController.js"
const router=express.Router();

router.get('/searchbox-recommend',getSearchBoxRecommend)

export default router;
