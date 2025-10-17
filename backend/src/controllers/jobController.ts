import { Request, Response } from "express";

export const getJobs = (_: Request, res: Response) => {
  const jobs = [
    { id: 1, title: "Frontend Engineer", skills: ["React", "TypeScript"] },
    { id: 2, title: "AI Engineer", skills: ["Python", "LLM", "LangChain"] },
  ];
  res.json(jobs);
};

export const rankFit = (req: Request, res: Response) => {
  const { profile } = req.body;
  const score = Math.floor(Math.random() * 100);
  res.json({ message: "Fit score (mock)", score, profile });
};
