import prisma from "../lib/prisma";
import { Request, Response } from "express";
import { Status } from '@prisma/client';


export const getCategories = async (req:Request, res:Response) => {

    const { name, id, status } = req.query

    // this checks if status exist and is a valid status included in the Status enum
    if(status && !Object.values(Status).includes(status.toString().toUpperCase() as Status)) {
        
        return res.status(400).json({success: false, message: "Invalid status"})
    }
    
    const statusFilter:{status?: Status} =  {}
    
    if (req.user?.role !== "ADMIN") {

        statusFilter.status = "APPROVED"

    }else if (status) {

        statusFilter.status = status.toString().toUpperCase() as Status
    }

    if(id) {

        if (isNaN(parseInt(id as string))) {

            return res.status(400).json({success: false, message: "Invalid ID"})
        }
    }       

    const categories = await prisma.category.findMany({
        where: {
            AND: [
                statusFilter,
                name? {name: {contains: name.toString(), mode: "insensitive"},} : {},
                id? {id: parseInt(id as string),} : {},
            ]
        },
    });

    res.status(200).json({
        success: true,
        authenticated: !!req.user,
        role: req.user ? req.user.role : null,
        data: categories,
    });
}

export const getCategoryById = async (req: Request, res: Response) => {

    const { id } = req.params

    if(isNaN(parseInt(id as string))) {
        return res.status(400).json({success: false, message: "Invalid ID"})
    }    

    const category = await prisma.category.findUnique({
        where: {
            id: parseInt(id as string),
            ...(req.user?.role === "ADMIN"? {} : {status: {in: ["APPROVED", "PENDING"]}}),
        },
    });

    if(!category){
        return res.status(404).json({
            success: false, 
            message: "Category not found",
            authenticated: !!req.user,
            role: req.user ? req.user.role : null,
        }) 
    } 
    
    res.status(200).json({
    success: true,
    authenticated: !!req.user,
    role: req.user ? req.user.role : null,     
    data: category,
    });

}

export const getQuotesFromCategoryId = async (req: Request, res: Response) => {

    const { id } = req.params

    if(isNaN(parseInt(id as string))) {
        return res.status(400).json({success: false, message: "Invalid ID"})
    }    

    const category = await prisma.category.findUnique({
        where: {
            id: parseInt(id as string),
            ...(req.user?.role === "ADMIN"? {} : {status: {in: ["APPROVED", "PENDING"]}}),
        },
    });

    if(!category){
        return res.status(404).json({
            success: false, 
            message: "Category not found",
            authenticated: !!req.user,
            role: req.user ? req.user.role : null,
        }) 
    } 

    const quotes = await prisma.quote.findMany({
        where: {
            categories: {some: { id: parseInt(id as string),},},
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

export const createCategory = async (req: Request, res: Response) => {

    const { name, } = req.body

    if (!name) {
        return res.status(400).json({success: false, message: "Category missing a name"});
    }

    const status =  process.env.AUTO_APPROVE === 'true'? "APPROVED" : undefined

    const newCategory =  await prisma.category.create({
        data: {
            name,
            status,
        },
    });
    res.status(201).json({
        sucess: true,
        message: "New category added",
        authenticated: !!req.user,
        role: req.user ? req.user.role : null,        
        data: newCategory,
    });
};

export const updateCategory = async (req: Request, res: Response) => {
    
    const { name, status } = req.body
    const { id } = req.params

    if(isNaN(parseInt(id as string))) {
        return res.status(400).json({success: false, message: "Invalid ID"})
    }

    if(status && !Object.values(Status).includes(status.toString().toUpperCase() as Status)) {
        
        return res.status(400).json({success: false, message: "Invalid status"})
    }    

    const category = await prisma.category.findUnique({
        where: {id: parseInt(id as string)}, 
    });
    
    if(!category){
        return res.status(404).json({success: false, message: "Category not found"}) 
    } 
    
    const updatedCategory = await prisma.category.update({
        where: {id: parseInt(id as string)},
        data: {
            name,
            status: status? status.toString().toUpperCase() : undefined,
        },
    });
    
    res.status(200).json({
    success: true, 
    message: "Category updated",
    authenticated: !!req.user,
    role: req.user ? req.user.role : null,     
    data: updatedCategory,
    });
}

export const deleteCategory = async (req: Request, res: Response,) => {

    const { id } = req.params

    if(isNaN(parseInt(id as string))) {
        return res.status(400).json({success: false, message: "Invalid ID"})
    }

    const category = await prisma.category.findUnique({
        where: {id: parseInt(id as string)},
    });

    if(!category){
        return res.status(404).json({success: false, message: "Category not found"}) 
    }

    const quotesOnCategory = await prisma.quote.findMany({
        where: {categories: {some: { id: parseInt(id as string),},},},
    });

    if (quotesOnCategory.length > 0) {
        return res.status(409).json({success: false, message: "Cannot delete category. Category has quotes associated with it"});
    }    

    await prisma.category.delete({ where: { id: parseInt(id as string) } });

    res.status(200).json({
    success: true, 
    message: "Category deleted",
    authenticated: !!req.user,
    role: req.user ? req.user.role : null,    
    data: category,
    });
}
