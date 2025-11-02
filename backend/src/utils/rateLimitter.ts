import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 60000,
  max: 10,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
