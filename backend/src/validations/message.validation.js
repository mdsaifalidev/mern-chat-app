import { z } from "zod";

const sendMessageSchema = z.object({
  message: z
    .string({
      required_error: "Message is required.",
      invalid_type_error: "Message must be a string.",
    })
    .trim()
    .min(1, { message: "Message is required." })
    .max(255, { message: "Message must be 255 or fewer characters long." }),
});

export { sendMessageSchema };
