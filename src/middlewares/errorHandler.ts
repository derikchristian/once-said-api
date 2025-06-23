import { Request, Response, NextFunction } from "express";

// improve the error system
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  
  console.error(err);

  let message = "Unexpected error format"
  
  if (err instanceof Error) {
    message = err.message;
  } else if (typeof err === "string") {
    message = err;
  }

  res.status(500).json({
    success: false,
    message: message,
  });
};