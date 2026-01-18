import express from "express";
import { manualCall, connectCall } from "../controllers/call.controller.js";

const router = express.Router();

router.post("/manual", manualCall);
router.post("/connect/:callId", connectCall);

export default router;
