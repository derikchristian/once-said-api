import jwt from "jsonwebtoken"

if (!process.env.JWT_SECRET) {
    
  throw new Error("JWT_SECRET is not defined in environment variables.");
}

const JWT_SECRET = process.env.JWT_SECRET

export function generateToken(data: object) {
    return jwt.sign(data, JWT_SECRET, {expiresIn: "1d"})
}

export default function verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET)
}