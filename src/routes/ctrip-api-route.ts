import express, { RequestHandler } from "express";
import {
    getBoardListShowSearch,
    getSearchBoxRecommend,
} from "../controllers/ctrip-api-controller.ts";
const router = express.Router();

router.get("/boardListShowSearch", getBoardListShowSearch);
router.get("/searchbox-recommend", getSearchBoxRecommend);
export default router;
