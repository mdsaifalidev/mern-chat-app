import { Router } from "express";
import * as message from "../controllers/message.controller.js";
import validate from "../middlewares/validation.middleware.js";
import * as validation from "../validations/message.validation.js";

const router = Router();

router
  .post(
    "/send/:id",
    validate(validation.sendMessageSchema),
    message.sendMessage
  )
  .get("/:id", message.getMessages);

export default router;
