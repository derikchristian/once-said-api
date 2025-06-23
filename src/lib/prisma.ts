import { PrismaClient } from '@prisma/client';

// Trim all strings and nested strings
function trim(data: any): any {
  
    if (!data || typeof data !== 'object') {
        return data;
    }

    for (const key in data) {
        
        const value = data[key];
        
        if (typeof value === 'string') {data[key] = value.trim();}

        if (typeof value === 'object' && value !== null) {data[key] = trim(value);}
    }

  return data;
}

const prisma = new PrismaClient().$extends({
    
    query: {
        
        $allModels: {
            
            async create({ args, query }) {

                args.data = trim(args.data);

                return query(args);
            },

            async update({ args, query }) {

                args.data = trim(args.data);

                return query(args);
            },
            
            async findFirst({ args, query }) {

                args.where = trim(args.where);

                return query(args);
            },
            
            async findUnique({ args, query }) {

                args.where = trim(args.where);

                return query(args);
            },
            
            async findMany({ args, query }) {

                args.where = trim(args.where);

                return query(args);
            },
        },
    },
});

export default prisma;

