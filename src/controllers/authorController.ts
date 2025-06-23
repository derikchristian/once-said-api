import prisma from "../lib/prisma";
import { Request, Response } from "express";
import { Status } from '@prisma/client';
import capitilize from "../utils/capitalize";


export const getAuthors = async (req:Request, res:Response) => {

    const { name, id, qualifier, status }: {name?:string, id?:string, qualifier?: string, status?:string} = req.query

    // this checks if status exist and is a valid status included in the Status enum
    if(status && !Object.values(Status).includes(status.toUpperCase() as Status)) {
        
        return res.status(400).json({success: false, message: "Invalid status"})
    }
    
    const statusFiltered:{status?: Status} =  {}
    
    //Setting status so non admin users only see approved results
    if (req.user?.role !== "ADMIN") {

        statusFiltered.status = "APPROVED"

    }else if (status) {

        statusFiltered.status = status.toUpperCase() as Status
    }

    if(id) {

        if (isNaN(parseInt(id)) || parseInt(id as string) <= 0) {

            return res.status(400).json({success: false, message: "Invalid ID"})
        }
    }       

    const authors = await prisma.author.findMany({
        where: {
            AND: [
                statusFiltered,
                name? {name: {contains: name, mode: "insensitive"},} : {},
                qualifier? {qualifier: {contains: qualifier, mode: "insensitive"},} : {},
                id? {id: parseInt(id),} : {},
            ]
        },
    });

    res.status(200).json({
        success: true,
        authenticated: !!req.user,
        role: req.user ? req.user.role : null,
        data: authors,
    });
}

export const getAuthorById = async (req: Request, res: Response) => {

    const { id } = req.params

    if(isNaN(parseInt(id)) || parseInt(id as string) <= 0) {
        return res.status(400).json({success: false, message: "Invalid ID"})
    }    

    const author = await prisma.author.findUnique({
        where: {
            id: parseInt(id as string),
            // filtering to not show rejected to admins so the list dont get full of irrelevant quotes
            ...(req.user?.role === "ADMIN"? {} : {status: {in: ["APPROVED", "PENDING"]}}),
        },
    })

    if(!author){
        return res.status(404).json({
            success: false, 
            message: "Author not found",
            authenticated: !!req.user,
            role: req.user ? req.user.role : null,
        }) 
    } 
    
    res.status(200).json({
    success: true,
    authenticated: !!req.user,
    role: req.user ? req.user.role : null,     
    data: author,
    });

}

export const getQuotesFromAuthorId = async (req: Request, res: Response) => {

    const { id } = req.params

    if(isNaN(parseInt(id)) || parseInt(id) <= 0) {
        return res.status(400).json({success: false, message: "Invalid ID"})
    }    

    const author = await prisma.author.findUnique({
        where: {
            id: parseInt(id),
            ...(req.user?.role === "ADMIN"? {} : {status: {in: ["APPROVED", "PENDING"]}}),
        },
    })

    if(!author){
        return res.status(404).json({
            success: false, 
            message: "Author not found",
            authenticated: !!req.user,
            role: req.user ? req.user.role : null,
        }) 
    }
    
    const quotes = await prisma.quote.findMany({
        where: {
            authorId: parseInt(id as string),
            ...(req.user?.role === "ADMIN"? {} : {status: {in: ["APPROVED", "PENDING"]}}),
        }
    })   
    
    res.status(200).json({
    success: true,
    authenticated: !!req.user,
    role: req.user ? req.user.role : null,     
    data: quotes,
    });

}

export const createAuthor = async (req: Request, res: Response) => {

    const { name, qualifier, imageUrl } = req.body

    if(!name || name === "") {
        return res.status(400).json({success: false, message: "Author missing a name"});
    }
    
    const bodyFields = [
        {value: name, label: "Author name", type: "string",},
        {value: qualifier, label: "Qualifier name", type: "string",},
        {value: imageUrl, label: "Image", type: "string",},
    ];

    for (const { value, label, type } of bodyFields) {
        if (value !== undefined && typeof value !== type) {
        return res.status(400).json({ success: false, message: `${label} is in the wrong format`,});}
    }   

    const authorExist = await prisma.author.findFirst({
        where: {
            name: name,
        },
    });

    if(authorExist && !qualifier) {
        return res.status(409).json({success: false, message: "Author with same name already exist, please add a qualifier"});
    }

    const status =  process.env.AUTO_APPROVE === 'true'? "APPROVED" : undefined

    const newAuthor =  await prisma.author.create({
        data: {
            name: capitilize(name) as string,
            qualifier: capitilize(qualifier),
            imageUrl,
            status,
        },
    });
    res.status(201).json({
        success: true,
        message: "New author added",
        authenticated: !!req.user,
        role: req.user ? req.user.role : null,        
        data: newAuthor,
    });
};

export const updateAuthor = async (req: Request, res: Response) => {
    
    const { name, qualifier, imageUrl, status } = req.body
    const { id } = req.params

    if(isNaN(parseInt(id as string)) || parseInt(id as string) <= 0) {
        return res.status(400).json({success: false, message: "Invalid ID"})
    }

    const bodyFields = [
    {value: name, label: "Author name", type: "string",},
    {value: qualifier, label: "Qualifier name", type: "string",},
    {value: imageUrl, label: "Image", type: "string",},
    {value: status, label: "status", type: "string",},
    ];

    for (const { value, label, type } of bodyFields) {
        if (value !== undefined && typeof value !== type) {
        return res.status(400).json({ success: false, message: `${label} is in the wrong format`,});}
    } 

    if(status && !Object.values(Status).includes(status.toUpperCase() as Status)) {
        
        return res.status(400).json({success: false, message: "Invalid status"})
    }    

    const author = await prisma.author.findUnique({
        where: {id: parseInt(id as string)}, 
    });
    
    if (!author) {
        return res.status(404).json({success: false, message: "Author not found"}) 
    } 
    
    const updatedAuthor = await prisma.author.update({
        where: {id: parseInt(id as string)},
        data: {
            name: capitilize(name),
            qualifier: capitilize(qualifier),
            imageUrl,
            status: status? status.toString().toUpperCase() : undefined,
        },
    });
    
    res.status(200).json({
    success: true, 
    message: "Author updated",
    authenticated: !!req.user,
    role: req.user ? req.user.role : null,     
    data: updatedAuthor,
    });
}

export const deleteAuthor = async (req: Request, res: Response,) => {

    const { id } = req.params

    if(isNaN(parseInt(id as string)) || parseInt(id as string) <= 0) {
        return res.status(400).json({success: false, message: "Invalid ID"})
    }

    const author = await prisma.author.findUnique({
        where: {id: parseInt(id as string)},
    });

    if(!author){
        return res.status(404).json({success: false, message: "Author not found"}) 
    }

    const quotesFromAuthor = await prisma.quote.findMany({
        where: { authorId: parseInt(id as string) }
    });

    if (quotesFromAuthor.length > 0) {
        return res.status(409).json({success: false, message: "Cannot delete author. Author has quotes associated with it"});
    }      

    await prisma.author.delete({ where: { id: parseInt(id as string) } });

    res.status(200).json({
    success: true, 
    message: "Author deleted",
    authenticated: !!req.user,
    role: req.user ? req.user.role : null,    
    data: author,
    });
}
