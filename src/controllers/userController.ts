import prisma from "../prisma/client";
import { Request, Response } from "express";
import { UserRole } from '@prisma/client';
import bcrypt from "bcrypt";

function toBoolean(value: unknown) {
    if (value === "true" || value === true) return true;
    if (value === "false" || value === false) return false;
    return "nonBoolean"
}

export const getUsers = async (req:Request, res:Response) => {

    const { username, id, role } = req.query

    if(role && !Object.values(UserRole).includes(role.toString().toUpperCase() as UserRole) && req.user?.role === 'ADMIN') {
        
        return res.status(400).json({success: false, message: "Invalid Role."})
    }   

    if(id) {

        if (isNaN(parseInt(id as string))) {

            return res.status(400).json({success: false, message: "Invalid ID."})
        }
    }       

    const users = await prisma.user.findMany({
        where: { 
            AND: [
                username? {username: {contains: username.toString(), mode: "insensitive"},} : {},
                id? {id: parseInt(id as string),} : {},
                role && req.user?.role === 'ADMIN'? {role: role.toString().toUpperCase() as UserRole } : {}
            ]
        },
        select: req.user?.role === 'ADMIN'? 
        { id: true, username: true, role: true, createdAt: true, isDeleted: true }: 
        { id: true, username: true, createdAt: true, isDeleted: true },    
    });

    res.status(200).json({
        success: true,
        authenticated: !!req.user,
        role: req.user ? req.user.role : null,
        data: users,
    });
}

export const getUserById = async (req: Request, res: Response) => {

    const { id } = req.params

    if(isNaN(parseInt(id as string))) {
        return res.status(400).json({success: false, message: "Invalid ID."})
    }    

    const user = await prisma.user.findUnique({
        where: {
            id: parseInt(id as string)
        },
        select: req.user?.id === parseInt(id as string) || req.user?.role === 'ADMIN'? 
        { id: true, username: true, role: true, createdAt: true, isDeleted: true }: 
        { id: true, username: true, createdAt: true, isDeleted: true },            
    });

    if(!user){
        return res.status(404).json({
            success: false, 
            message: "User not found.",
            authenticated: !!req.user,
            role: req.user ? req.user.role : null,
        }) 
    } 
    
    res.status(200).json({
    success: true,
    authenticated: !!req.user,
    role: req.user ? req.user.role : null,     
    data: user,
    });
}

export const getUserQuotesByUserId = async (req: Request, res: Response) => {

    const { id } = req.params

    if(isNaN(parseInt(id as string))) {
        return res.status(400).json({success: false, message: "Invalid ID."})
    }    

    const user = await prisma.user.findUnique({
        where: {
            id: parseInt(id as string)
        },
    });

    if(!user){
        return res.status(404).json({
            success: false, 
            message: "User not found.",
            authenticated: !!req.user,
            role: req.user ? req.user.role : null,
        }) 
    } 

    const quotes = await prisma.quote.findMany({
        where: {
            submittedById: parseInt(id as string),
            ...(req.user?.id === parseInt(id as string) || req.user?.role === "ADMIN"? {} : {status: {in: ["APPROVED", "PENDING"]}}),
        }
    })
    
    res.status(200).json({
    success: true,
    authenticated: !!req.user,
    role: req.user ? req.user.role : null,     
    data: quotes,
    });

}

export const updateUser = async (req: Request, res: Response) => {
    
    const { username, password, role, isDeleted } = req.body
    const { id } = req.params
    const isDeletedBol = toBoolean(isDeleted)

    if(isNaN(parseInt(id as string))) {
        return res.status(400).json({success: false, message: "Invalid ID."})
    }

    if(isDeletedBol === "nonBoolean") {
        return res.status(400).json({success: false, message: "isDeleted is neither true or false."})
    }

    if(role && !Object.values(UserRole).includes(role.toString().toUpperCase() as UserRole) && req.user?.role === 'ADMIN') {
        
        return res.status(400).json({success: false, message: "Invalid Role"})
    } 
    
    if (await prisma.user.findUnique({where: {username}})) {

        return res.status(409).json({success: false, message: "Username already exists.",})
    }    

    const user = await prisma.user.findUnique({
        where: {id: parseInt(id as string)}, 
    })
    
    if(!user){
        return res.status(404).json({success: false, message: "User not found."}) 
    }
    
    if (req.user?.id !== parseInt(id as string) && req.user?.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "Forbidden",
            authenticated: !!req.user,
            role: req.user ? req.user.role : null,
        });
    }
    
    if (req.user?.role !== "ADMIN" && role || isDeleted) {
        return res.status(403).json({
            success: false,
            message: "Users cannot change their own roles or modify isDeleted directly.",
            authenticated: !!req.user,
            role: req.user ? req.user.role : null,
        });
    }

    if (req.user?.id !== parseInt(id as string) && password) {
        return res.status(403).json({
            success: false,
            message: "Admins cannot change a user password.",
            authenticated: !!req.user,
            role: req.user ? req.user.role : null,
        });
    }
    
    const updatedUser = await prisma.user.update({
        where: {id: parseInt(id as string)},
        data: {
            username,
            password: await bcrypt.hash(password, 8),
            role: role? role.toString().toUpperCase() : undefined,
            isDeleted: isDeletedBol,
        },
        select: {
            id: true,
            username: true,
            role: true,
            createdAt: true,
            isDeleted: true
        }
    });
    
    res.status(200).json({
    success: true, 
    message: "User updated.",
    authenticated: !!req.user,
    role: req.user ? req.user.role : null,     
    data: updatedUser,
    });
}

export const deleteUser = async (req: Request, res: Response,) => {

    const { id } = req.params

    if (isNaN(parseInt(id as string))) {
        return res.status(400).json({success: false, message: "Invalid ID."})
    }

    const user = await prisma.user.findUnique({
        where: {id: parseInt(id as string)},
    });

    if (!user) {
        return res.status(404).json({success: false, message: "User not found."}) 
    }

    if (req.user?.id !== parseInt(id as string) && req.user?.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "Only admins or the respective user can delete an account.",
            authenticated: !!req.user,
            role: req.user ? req.user.role : null,
        });
    }

    await prisma.user.update({ 
        where: {id: parseInt(id as string)},
        data: {
            isDeleted: true, 
            username: `deleteduser${parseInt(id as string)}`
        },
        select: {
            id: true,
            username: true,
            role: true,
            createdAt: true,
            isDeleted: true
        },        
    });

    res.status(200).json({
    success: true, 
    message: "User deleted.",
    authenticated: !!req.user,
    role: req.user ? req.user.role : null,    
    data: user,
    });
}
