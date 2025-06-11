import { Request, Response, NextFunction } from "express";

type ContollerCalback = (req:Request, res:Response, next:NextFunction) => Promise<unknown>;

export const asyncHandler = (funct: ContollerCalback) => {
  return (req: Request, res: Response, next: NextFunction) => {
    
    funct(req, res, next).catch(next);
  }
};