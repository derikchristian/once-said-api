import prisma from "../src/lib/prisma";
import seedData from "./seedData.json"

async function main() {

    await prisma.quote.deleteMany();
    await prisma.author.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
   
    for (const category of seedData.categories) {
        
        const status =  process.env.AUTO_APPROVE === 'true'? "APPROVED" : undefined

        await prisma.category.create({
            data: {name: category.name, status}
        });
    };

    for (const author of seedData.authors) {
        
        const status =  process.env.AUTO_APPROVE === 'true'? "APPROVED" : undefined

        await prisma.author.create({
            data: {
                name: author.name,
                imageUrl: author.imageUrl,
                status,
            }
        
        });
    }

    for (const quote of seedData.quotes) {

        const author = await prisma.author.findFirst({where: { name: quote.author.name },});
        const categoryIds: { id: number }[] = [];

        for (const category of quote.categories) {
            
            const categoryObj = await prisma.category.findUnique({where: { name: category.name },});
            categoryIds.push({ id: categoryObj!.id });
        }
        
        const status =  process.env.AUTO_APPROVE === 'true'? "APPROVED" : undefined

        await prisma.quote.create({
            data: {
                content: quote.content,
                authorId: author!.id,
                categories:{connect:categoryIds},
                language: quote.language,
                status,
            }
        
        });
    }; 
}

main().then(() => {
    console.log("Initial data added")
    return prisma.$disconnect();
})
.catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
});