import prisma from "../lib/prisma";
import { Request, Response } from "express";
import { Status } from '@prisma/client';
import capitilize from "../utils/capitalize";

export const getQuotes = async (req:Request, res:Response) => {

    const { search, id, category, categoryId, status, language, author, authorId, submittedBy, submittedById }: {search?: string, id?: string, category?: string, categoryId?: string, status?: string, language?: string, author?: string, authorId?: string, submittedBy?: string, submittedById?: string} = req.query

    // this checks if status exist and is a valid status included in the Status enum
    if(status && !Object.values(Status).includes(status.toUpperCase() as Status)) {
        
        return res.status(400).json({success: false, message: "Invalid status"})
    }
    
    const statusFilter:{status?: Status} =  {}
    
    if (req.user?.role !== "ADMIN") {

        statusFilter.status = "APPROVED"

    }else if (status) {

        statusFilter.status = status.toUpperCase() as Status
    }
    
    const bodyIdFields = [
    {value: id, label: "quote",},
    {value: categoryId, label: "category",},
    {value: authorId, label: "authors",},
    {value: submittedById, label: "user",},
    ];

    for (const { value, label } of bodyIdFields) {
        
        if (value !== undefined && ( isNaN(parseInt(value)) || parseInt(value) <= 0 )) {

            return res.status(400).json({ success: false, message: `Invalid ${label} ID`,})
        }
    }

    const quotes = await prisma.quote.findMany({
        where: {
            AND: [
                statusFilter,
                search? {content: {contains: search, mode: "insensitive"},} : {},
                id? {id: parseInt(id)} : {},
                category? {categories: {some: {name: {equals: category, mode: "insensitive"},},},} : {},
                categoryId? {categories: {some: {id: parseInt(categoryId),},},} : {},
                language? {language: {contains: language, mode: "insensitive"},} : {},
                author? {author: {name: {contains: author, mode: "insensitive"},},} : {},
                authorId? {authorId: parseInt(authorId),} : {},
                submittedBy? {submittedBy: {username: {contains: submittedBy, mode: "insensitive"},},} : {},
                submittedById? {submittedById: parseInt(submittedById),} : {}
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

    if(isNaN(parseInt(id as string)) || parseInt(id) <= 0) {

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

    const { search, category, categoryId, language, author, authorId }: {search?: string, category?: string, categoryId?: string, language?: string, author?: string, authorId?: string,} = req.query

    // count the amount of passed queries except language
    const activeFilters = [search, category, categoryId, author, authorId].filter(Boolean)

    const bodyIdFields = [
    {value: categoryId, label: "category",},
    {value: authorId, label: "authors",},
    ];

    for (const { value, label } of bodyIdFields) {

        if (value !== undefined && ( isNaN(parseInt(value)) || parseInt(value) <= 0 )) {

            return res.status(400).json({ success: false, message: `Invalid ${label} ID`,})
        }
    }

    const quotesAmount = await prisma.quote.count({
        
        where: {
            status: "APPROVED",
            AND: [
            search? {content: {contains: search, mode: "insensitive"},} : {},
            category? {categories: {some: {name: {equals: category, mode: "insensitive"},},},} : {},
            categoryId? {categories: {some: {id: parseInt(categoryId),},},} : {},
            language? {language: {contains: language, mode: "insensitive"},} : {},
            author? {author: {name: {contains: author, mode: "insensitive"},},} : {},
            authorId? {authorId: parseInt(authorId),} : {},
            ]
        }
    })

    // generates a random index
    const index = Math.floor(Math.random() * quotesAmount)

    const [ quote ] = await prisma.quote.findMany({
        
        where: {
            status: "APPROVED",
            AND: [
            search? {content: {contains: search, mode: "insensitive"},} : {},
            category? {categories: {some: {name: {equals: category, mode: "insensitive"},},},} : {},
            categoryId? {categories: {some: {id: parseInt(categoryId),},},} : {},
            language? {language: {contains: language, mode: "insensitive"},} : {},
            author? {author: {name: {contains: author, mode: "insensitive"},},} : {},
            authorId? {authorId: parseInt(authorId),} : {},
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
        message:activeFilters.length > 1? "Warning: you're filtering multiple parameters in a random request" : "",
        authenticated: !!req.user,
        role: req.user ? req.user.role : null,         
        data: quote
    })
};

export const createQuote = async (req: Request, res: Response) => {

    const { content, authorId, categoriesIds, language } = req.body

    if (!content) {
        return res.status(400).json({ success: false, message: "Quote missing its content",});
    }

    if (!language) {
        return res.status(400).json({ success: false, message: "Quote missing a language",});
    }

    // using parseInt so it also converts stings
    if(isNaN(parseInt(authorId)) || parseInt(authorId) <= 0) {
        return res.status(400).json({success: false, message: "Invalid author ID"})
    }

    if (categoriesIds && !Array.isArray(categoriesIds)) {
      
        return res.status(400).json({success: false, message: "Categories Ids it's on the wrong format.",});
    }

    if (!categoriesIds || categoriesIds.length === 0) {
      
        return res.status(400).json({success: false, message: "Missing or empty categories",});
    }

    if (categoriesIds.some((id: unknown) => !isNaN(parseInt(id as string)))) {
        
        return res.status(400).json({success: false, message: "categories it's not a list of numbers",});
    }

    const bodyFields = [
        {value: content, label: "Content", type: "string",},
        {value: language, label: "Language", type: "string",},
    ];

    for (const { value, label, type } of bodyFields) {
        if (value !== undefined && typeof value !== type) {
        return res.status(400).json({ success: false, message: `${label} is in the wrong format`,});}
    }

    const quote = await prisma.quote.findUnique({
        where: { content },
    });

    if (quote) {

        return res.status(400).json({success: false, message: "Quote text already exists.",});
    }
    
    const author = await prisma.author.findUnique({ where: { id: authorId } });
    
    if (!author) {
        
        return res.status(400).json({ success: false, message: "Author ID not found" });
    }

    const filteredCategoriesIds = [...new Set(categoriesIds.map( (id: string | number ) => parseInt(id as string)))] as number[];
    const categories = await prisma.category.findMany({where: {id: { in: filteredCategoriesIds as number[] },},});

    if (categories.length !== filteredCategoriesIds.length) {
        
        const missing = categoriesIds.length - categories.length;

        return res.status(400).json({success: false, message: `${missing} category ID${missing === 1? "" : "s"} were not found`,});
    }

    const status =  process.env.AUTO_APPROVE === 'true'? "APPROVED" : undefined

    const newQuote =  await prisma.quote.create({
        data: {
            content: capitilize(content) as string, 
            authorId: parseInt(authorId), 
            categories:{connect:filteredCategoriesIds.map((id: number) => ({id})),},
            language: capitilize(language) as string, 
            submittedById: req.user!.id,
            status, 
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
        success: true,
        message: "New quote added",
        authenticated: !!req.user,
        role: req.user ? req.user.role : null,        
        data: newQuote,
    });
};

export const updateQuote = async (req: Request, res: Response) => {
    
    const { content, authorId, categoriesIds, language, status } = req.body
    const { id } = req.params

    if(isNaN(parseInt(id as string)) || parseInt(id as string) <= 0) {

        return res.status(400).json({success: false, message: "Invalid quote ID"})
    }

    const bodyFields = [
        {value: content, label: "Content", type: "string",},
        {value: language, label: "Language", type: "string",},
    ];

    for (const { value, label, type } of bodyFields) {
        if (value && typeof value !== type) {
        return res.status(400).json({ success: false, message: `${label} is in the wrong format or empty`,});}
    }

    if(status && !Object.values(Status).includes(status.toUpperCase() as Status)) {
        
        return res.status(400).json({success: false, message: "Invalid status"})
    }

    if( authorId && (isNaN(parseInt(authorId)) || parseInt(authorId) <= 0)) {

        return res.status(400).json({success: false, message: "Invalid author ID"})
    }

    if (categoriesIds && !Array.isArray(categoriesIds)) {
      
        return res.status(400).json({success: false, message: "Categories Ids it's on the wrong format.",});
    }

    if (categoriesIds && categoriesIds.length === 0) {
      
        return res.status(400).json({success: false, message: "Categories IDs exist but is empty, quotes have at least one ID",});
    }

    if (categoriesIds && categoriesIds.some((id: unknown) => !isNaN(parseInt(id as string)))) {
        
        return res.status(400).json({success: false, message: "categories it's not a list of numbers",});
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

    if(status && !Object.values(Status).includes(status.toString().toUpperCase() as Status)) {
        
        return res.status(400).json({success: false, message: "Invalid status"})
    }    

    const author = await prisma.author.findUnique({ where: { id: authorId } });
    
    if (!author) {

        return res.status(400).json({ success: false, message: "Author Id not found" });
    }

    if (categoriesIds.some((id: unknown) => !Number.isInteger(Number(id)))) {
        
        return res.status(400).json({success: false, message: "categories it's not a list of integers",});
    }

    const categories = await prisma.category.findMany({where: {id: { in: categoriesIds },},});

    if (categories.length !== categoriesIds.length) {
        
        const missing = categoriesIds.length - categories.length;

        return res.status(400).json({success: false, message: `${missing} category ID${missing === 1? "" : "s"} were not found`,});
    }
    
    const updatedQuote = await prisma.quote.update({
        where: {id: parseInt(id as string)},
        data: {
            content: capitilize(content),
            authorId,
            categories: categories? {set:categoriesIds.map((id: number) => ({id})),}: {},
            language: capitilize(language),
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

    if(isNaN(parseInt(id as string)) || parseInt(id as string) <= 0) {
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
