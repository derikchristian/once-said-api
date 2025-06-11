import { Request, Response, NextFunction } from "express";

export const roleCheck = (requiredRoles: string[]) => {
    
    return (req: Request, res: Response, next: NextFunction) => {
        
        if (!req.user || !requiredRoles.includes(req.user.role)) {
            
            res.status(403).json({success: false, message: "Access denied!",});
            return 
        }
        next();
    };
};