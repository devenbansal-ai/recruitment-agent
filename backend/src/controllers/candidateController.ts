import { Request, Response } from "express";

export const uploadResume = (req: Request, res: Response) => {
  res.json({ message: "Resume uploaded (mock)" });
};

export const extractProfile = (req: Request, res: Response) => {
  const profile = {
    name: "John Doe",
    skills: ["React", "Node.js", "Python"],
    experience: "2 years",
  };
  res.json({ profile });
};
