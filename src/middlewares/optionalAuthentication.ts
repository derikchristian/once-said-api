import { JwtPayload } from "jsonwebtoken";
import verifyToken from "../utils/jwt";
import { Request, Response, NextFunction } from "express";

export const optionalAuthenticate = (req: Request, _res: Response, next: NextFunction) => {

    const authenticationHeader = req.headers.authorization;

    if (authenticationHeader && authenticationHeader.startsWith("Bearer ")) {

    const token = authenticationHeader.split(" ")[1];

        try {
            const decodedToken = verifyToken(token) as JwtPayload;

            req.user = {
                id: decodedToken.userId,
                username: decodedToken.username,
                role: decodedToken.role,
            };

        } catch (err) {
            
            console.warn("Invalid or expired Token, proceeding without authentication.");
        }
    }
    
    next()
}