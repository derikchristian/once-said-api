import { JwtPayload } from "jsonwebtoken";
import verifyToken from "../utils/jwt";
import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma"

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {

    const authenticationHeader = req.headers.authorization;

    if (!authenticationHeader) {
        res.status(401).json({success: false, message: "Authorization header missing."});
        return
    }

    if (!authenticationHeader.startsWith("Bearer ")) {
        res.status(401).json({success: false, message: "Authorization token of invalid type. Please provide a valid Bearer token."});
        return 
    }

    const token = authenticationHeader.split(" ")[1];

    try {
        const decodedToken = verifyToken(token) as JwtPayload;

        const user = await prisma.user.findUnique({
            where: { id: decodedToken.userId },
        });  
        
        if (!user || user.isDeleted) {
            res.status(400).json({ success: false, message: "User not found or is deleted." });
            return
        }        

        req.user = {
            id: decodedToken.userId,
            username: decodedToken.username,
            role: decodedToken.role,
        };

        next();
    } catch (err) {
        res.status(401).json({success: false, message: "Invalid or expired token"});
        return 
    }
}