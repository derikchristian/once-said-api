import bcrypt from "bcrypt"
import prisma from "../lib/prisma"
import { Request, Response } from "express"
import { generateToken } from "../utils/jwt";

export const register = async (req: Request, res: Response) => {
    
    const { username, password } = req.body

    if (!username) {

        return res.status(400).json({success: false, message: "Username is required",})
    }

    if (!password) {

        return res.status(400).json({success: false, message: "Password is required",})
    }

    const bodyFields = [
        {value: username, label: "Username", type: "string",},
        {value: password, label: "Password", type: "string",},
    ];

    for (const { value, label, type } of bodyFields) {
        if (typeof value !== type) {
        return res.status(400).json({ success: false, message: `${label} is in the wrong format`,});}
    }

    if (await prisma.user.findUnique({where: {username}})) {

        return res.status(409).json({success: false, message: "Username already exists",})
    }
    
    // using 8 for demonstration purposes, use 12 or more if you actually care about security
    const hashPassword = await bcrypt.hash(password, 8)

    const newUser = await prisma.user.create({
        data: {
            username,
            password: hashPassword
        },
    });

    res.status(201).json({
        success: true,
        message: "New user created",
        data: { id: newUser.id, username: newUser.username },
    });    

};

export const login = async (req: Request, res: Response) => {
    
    const { username, password } = req.body

    if (!username) {return res.status(400).json({success: false, message: "Username is required.",});}

    if (!password) {return res.status(400).json({success: false, message: "Password is required.",});}

    const bodyFields = [
    {value: username, label: "Username", type: "string",},
    {value: password, label: "Password", type: "string",},
    ];

    for (const { value, label, type } of bodyFields) {
        
        if (typeof value !== type) {
            
            return res.status(400).json({success: false, message: `${label} is in the wrong format`,});}
        }

    const user = await prisma.user.findUnique({where: {username}})

    if(!user || user.isDeleted){return res.status(401).json({success: false, message: "Incorrect username or password.",});}

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if(!isPasswordCorrect){return res.status(401).json({success: false, message: "Incorrect username or password.",});}

    const token = generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
    });

    res.status(200).json({
        success: true, 
        message: "User logged",
        data: token
    })

};
