import prisma from "../prisma/client";
import { Request, Response } from "express";
import { Status } from '@prisma/client';

export const getQuotes = async (req:Request, res:Response) => {

    const { search, id, category, categoryId, status, language, author, authorId, submittedBy, submittedById } = req.query

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

    if (category && categoryId) {

        return res.status(400).json({success: false, message: "Use either category or categoryId"})
    }    

    if (author && authorId) {

        return res.status(400).json({success: false, message: "Use either author or authorId"})
    }

    if (id) {

        if (isNaN(parseInt(id as string))) {

            return res.status(400).json({success: false, message: "Invalid ID"})
        }
    }

    if (categoryId && isNaN(parseInt(categoryId as string))) {

        return res.status(400).json({success: false, message: "Invalid category Id"})
    }    

    if (authorId) {

        if (authorId && isNaN(parseInt(authorId as string))) {

            return res.status(400).json({success: false, message: "Invalid author ID"})
        }
    }    

    if (submittedById) {

        if (isNaN(parseInt(submittedById as string))) {

            return res.status(400).json({success: false, message: "Invalid user ID"})
        }
    }    

    const quotes = await prisma.quote.findMany({
        where: {
            AND: [
                statusFilter,
                search? {content: {contains: search.toString(), mode: "insensitive"},} : {},
                id? {id: parseInt(id as string)} : {},
                category? {categories: {some: {name: {equals: category.toString(), mode: "insensitive"},},},} : {},
                categoryId? {categories: {some: {id: parseInt(categoryId as string),},},} : {},
                language? {language: {contains: language.toString(), mode: "insensitive"},} : {},
                author? {author: {name: {contains: author.toString(), mode: "insensitive"},},} : {},
                authorId? {authorId: parseInt(authorId as string),} : {},
                submittedBy? {submittedBy: {username: {contains: submittedBy.toString(), mode: "insensitive"},},} : {},
                submittedById? {submittedById: parseInt(submittedById as string),} : {}
            ]
        },
        include: {
            categories: {
                select: {
                    id: true,
                    name: true,
                },
            },
            author: {
                select: {
                    id: true,
                    name: true,
                    imageUrl: true,
                },
            }
        }
    });

    res.status(200).json({
        success: true,
        authenticated: !!req.user,
        role: req.user ? req.user.role : null,
        data: quotes,
    });
}

export const getQuoteById = async (req: Request, res: Response) => {

    const { id } = req.params

    if(isNaN(parseInt(id as string))) {
        return res.status(400).json({success: false, message: "Invalid ID"})
    }    

    const quote = await prisma.quote.findUnique({
        where: {
            id: parseInt(id as string),
            ...(req.user?.role === "ADMIN"? {} : { status: "APPROVED" }),
        }, 
        include: {
        author: true,
        categories: true,
        submittedBy: {
                select: {
                    username: true,
                    id: true,
                },
            },
        },
    })

    if(!quote){
        return res.status(404).json({
            success: false, 
            message: "Quote not found",
            authenticated: !!req.user,
            role: req.user ? req.user.role : null,
        }) 
    } 
    
    res.status(200).json({
    success: true,
    authenticated: !!req.user,
    role: req.user ? req.user.role : null,     
    data: quote,
    });

}

export const getRandomQuote = async (req: Request, res: Response) => {

    const { search, category, categoryId, language, author, authorId } = req.query
    let isMultisearchOnRandom = false

    // count the amount of passed queries
    const activeFilters = [search, category, categoryId, author, authorId].filter(Boolean)

    if (activeFilters.length > 1) isMultisearchOnRandom = true;

    const quotesAmount = await prisma.quote.count({
        
        where: {
            status: "APPROVED",
            AND: [
            search? {content: {contains: search.toString(), mode: "insensitive"},} : {},
            category? {categories: {some: {name: {equals: category.toString(), mode: "insensitive"},},},} : {},
            categoryId? {categories: {some: {id: parseInt(categoryId as string),},},} : {},
            language? {language: {contains: language.toString(), mode: "insensitive"},} : {},
            author? {author: {name: {contains: author.toString(), mode: "insensitive"},},} : {},
            authorId? {authorId: parseInt(authorId as string),} : {},
            ]
        }
    })

    // generates a random index
    const index = Math.floor(Math.random() * quotesAmount)

    const [ quote ] = await prisma.quote.findMany({
        
        where: {
            status: "APPROVED",
            AND: [
            search? {content: {contains: search.toString(), mode: "insensitive"},} : {},
            category? {categories: {some: {name: {equals: category.toString(), mode: "insensitive"},},},} : {},
            categoryId? {categories: {some: {id: parseInt(categoryId as string),},},} : {},
            language? {language: {contains: language.toString(), mode: "insensitive"},} : {},
            author? {author: {name: {contains: author.toString(), mode: "insensitive"},},} : {},
            authorId? {authorId: parseInt(authorId as string),} : {},
            ]
        },
        skip: index,
        take: 1,
        include: {
            author: true,
            categories: true,
            submittedBy: {
                select: {
                    username: true,
                    id: true,
                },
            },
        },
    })

    res.status(200).json({
        success: true, 
        message:isMultisearchOnRandom? "Warning: you're filtering multiple parameters in a random request" : "",
        authenticated: !!req.user,
        role: req.user ? req.user.role : null,         
        data: quote
    })
};

export const createQuote = async (req: Request, res: Response) => {

    const { content, authorId, categories, language } = req.body

    if (!content || !authorId || !categories || !language) {
        
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    
    if (categories && !Array.isArray(categories)) {
      
        return res.status(400).json({success: false, message: "Categories it's on the wrong format"})
    }

    if (categories.some(Number.isNaN)) {

        return res.status(400).json({success: false, message: "Categories has at least one invalid ID"})
    }

    const newQuote =  await prisma.quote.create({
        data: {
            content, 
            authorId, 
            categories:{connect:categories.map((id: number) => ({id})),},
            language, 
            submittedById: req.user!.id 
        },include:{
            author: true,
            categories: true,
            submittedBy: {
                select: {
                    username: true,
                    id: true,
                },
            },          
        },
    });
    res.status(201).json({
        sucess: true,
        message: "New quote added",
        authenticated: !!req.user,
        role: req.user ? req.user.role : null,        
        data: newQuote,
    });
};

export const updateQuote = async (req: Request, res: Response) => {
    
    const { content, authorId, categories, language, status } = req.body
    const { id } = req.params

    if(isNaN(parseInt(id as string))) {
        return res.status(400).json({success: false, message: "Invalid ID"})
    }

    if(status && !Object.values(Status).includes(status.toString().toUpperCase() as Status)) {
        
        return res.status(400).json({success: false, message: "Invalid status"})
    }    

    const quote = await prisma.quote.findUnique({
        where: {id: parseInt(id as string)}, 
    })
    
    if(!quote){
        return res.status(404).json({success: false, message: "Quote not found"}) 
    }
    
    if (req.user?.role !== "ADMIN" && quote.submittedById !== req.user?.id) {
        return res.status(403).json({
            success: false,
            message: "Forbidden",
            authenticated: !!req.user,
            role: req.user ? req.user.role : null,
        });
    }
    
    if (req.user?.role !== "ADMIN" && status) {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to update the status of a quote.",
            authenticated: !!req.user,
            role: req.user ? req.user.role : null,
        });
    }
    
    const updatedQuote = await prisma.quote.update({
        where: {id: parseInt(id as string)},
        data: {
            content,
            authorId,
            categories: categories? {set:categories.map((id: number) => ({id})),}: {},
            language,
            status: status? status.toString().toUpperCase() : undefined,
        },
        include: {
            author: true,
            categories: true,
            submittedBy: {
                select: {
                    username: true,
                    id: true,
                },
            },
        },
    });
    
    res.status(200).json({
    success: true, 
    message: "Quote updated",
    authenticated: !!req.user,
    role: req.user ? req.user.role : null,     
    data: updatedQuote,
    });
}

export const deleteQuote = async (req: Request, res: Response,) => {

    const { id } = req.params

    if(isNaN(parseInt(id as string))) {
        return res.status(400).json({success: false, message: "Invalid ID"})
    }

    const quote = await prisma.quote.findUnique({
        where: {id: parseInt(id as string)}, 
        include: {
        author: true,
        categories: true,
        submittedBy: {
                select: {
                    username: true,
                    id: true,
                },
            },
        },
    })

    if(!quote){
        return res.status(404).json({success: false, message: "Quote not found"}) 
    }

    if (req.user?.role !== "ADMIN" && quote.submittedById !== req.user?.id) {
        return res.status(403).json({
            success: false,
            message: "Forbidden",
            authenticated: !!req.user,
            role: req.user ? req.user.role : null,
        });
    }

    await prisma.quote.delete({ where: { id: parseInt(id as string) } });

    res.status(200).json({
    success: true, 
    message: "Quote deleted",
    authenticated: !!req.user,
    role: req.user ? req.user.role : null,    
    data: quote,
    });
}
