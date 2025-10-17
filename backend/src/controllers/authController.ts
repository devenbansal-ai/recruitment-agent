import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const login = (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  const token = jwt.sign({ email }, process.env.JWT_SECRET || "mock", { expiresIn: "1h" });
  res.json({ token, email });
};

export const signup = (req: Request, res: Response) => {
  const { email, name } = req.body;
  res.json({ message: "User created (mock)", email, name });
};

export const getProfile = (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ message: "Profile data (mock)", user });
};
