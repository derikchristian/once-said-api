
# Once Said API

> 🇧🇷 **Este README também está disponível em [Português](#leia-em-português)**

A fast and simple REST API that manages quotes, authors, categories, and users and serves quotes. This project is designed to be simple to use, and simplify citations or themed quote features.


> ✅ Built with **Node.js**, **TypeScript**, **Prisma**, **PostgreSQL** and **Express**, focusing on clean architecture, type safety, and maintainability.

> ✅ Includes authentication, role-based access, content filtering, and flexible quote search.

## Installation & Run

### 1. Clone the repository

```bash
git clone https://github.com/derikchristian/once-said-api
cd once-said-api
```

### 2. Install dependencies

```bash
npm install
```


### 3. Make your .env

```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/your_database
JWT_SECRET=your_jwt_secret
```

### 4. Create tables

```bash
npx prisma db push
```

### 5. Start the server

```bash
npm run dev
```

The API will be available at:
http://localhost:3000

---

## API Routes 

### Athentication

| Method | Endpoint                       | Description                        | Authentication     |
| ------ | ------------------------------ | ---------------------------------- | ------------------ |
| POST   | `/authentication/register`     | Register a new user                | No authentication  |
| POST   | `/authentication/login`        | Login and get a token              | No authentication  |

### Users

| Method | Endpoint                       | Description                        | Authentication     |
| ------ | ------------------------------ | ---------------------------------- | ------------------ |
| GET    | `/users`                       | Lists all users                    | Optional           |
| GET    | `/users/id`                    | Get a user by id                   | Optional           |
| GET    | `/users/id/quotes`             | Get all quotes posted by a user    | Optional           |
| PATCH  | `/users/id`                    | Update a user                      | Oequired           |
| DELETE | `/users/id`                    | Delete a user                      | Oequired           |

### Quotes

| Method | Endpoint                       | Description                        | Authentication     |
| ------ | ------------------------------ | ---------------------------------- | ------------------ |
| GET    | `/quotes`                      | Lists all quotes                   | Optional           |
| GET    | `/quotes/id`                   | Get a quote by id                  | Optional           |
| GET    | `/quotes/random`               | Get a random quote                 | Optional           |
| POST   | `/quotes`                      | Create a quote                     | Required           |
| PATCH  | `/quotes/id`                   | Update a quote                     | Required           |
| DELETE | `/quotes/id`                   | Delete a quote                     | Required           |

### Categories

| Method | Endpoint                       | Description                        | Authentication     |
| ------ | ------------------------------ | ---------------------------------- | ------------------ |
| GET    | `/categories`                  | Lists all categories               | Optional           |    
| GET    | `/categories/id`               | Get a category by id               | Optional           |
| GET    | `/categories/quotes`           | Get all categories from a category | Optional           |
| POST   | `/categories`                  | Create a category                  | Required           |
| PATCH  | `/categories/id`               | Update a category                  | Required           |
| DELETE | `/categories/id`               | Delete a category                  | Required           |

### Authors

| Method | Endpoint                       | Description                        | Authentication     |
| ------ | ------------------------------ | ---------------------------------- | ------------------ |
| GET    | `/authors`                     | Lists all authors                  | Optional           |
| GET    | `/authors/id`                  | Get a author by id                 | Optional           |
| GET    | `/authors/quotes`              | Get all quotes from a author       | Optional           |
| POST   | `/authors`                     | Create a author                    | Required           |
| PATCH  | `/authors/id`                  | Update a author                    | Required           |
| DELETE | `/authors/id`                  | Delete a author                    | Required           |


**`GET quotes examples`**

### 1. GET quotes

**Return all quotes**

**Response Example:**

```json
{
    "success": true, // For use in sucess checks
    "authenticated": false, // True if the user is authenticated
    "role": null, // Shows your role if authenticated
    "data": [
        {
            "id": 9,
            "content": "I think, therefore I am.",
            "authorId": 12,
            "language": "english", // The language field exists to support the same quote in a different language
            "status": "APPROVED",
            "createdAt": "2025-06-06T20:17:30.787Z",
            "submittedById": 1,
            "categories": [
                {
                    "id": 4,
                    "name": "Philosophy"
                }
            ],
            "author": {
                "id": 12,
                "name": "René Descartes",
                "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg/800px-Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg"
            }
        },
        // ...Remaining quotes for the search
     ]
};    
```

### 2. Get quotes/id and quotes/random with authentication and admin role

**Return one quote**

```json
{
    "success": true,
    "authenticated": true,
    "role": "ADMIN",
    "data": {
        "id": 9,
        "content": "I think, therefore I am.",
        "authorId": 12,
        "language": "english",
        "status": "PENDING", // only admins see all pending quotes
        "createdAt": "2025-06-06T20:17:30.787Z",
        "submittedById": 1,
        "author": {
            "id": 12,
            "name": "René Descartes",
            "qualifier": null,
            "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg/800px-Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg",
            "status": "PENDING"
        },
        "categories": [
            {
                "id": 4,
                "name": "Philosophy",
                "status": "PENDING"
            }
        ],
        "submittedBy": {
            "username": "Test1",
            "id": 1
        }
    }
}   
```

**Categories, authors and users follow the same structure**

**most GET routes also implements queries for filtering**

Quotes, quotes/random filtering queries:

| Parameter        | Type     | Description                                                             |
|------------------|----------|-------------------------------------------------------------------------|
| `search`         | `string` | Filter by quote text content (partial or full match)                    |
| `id`             | `number` | Filter by quote id                                                      |
| `author`         | `string` | Filter by author name                                                   |
| `authorId`       | `number` | Filter by exact author ID                                               |
| `category`       | `string` | Filter by category name                                                 |
| `categoryId`     | `number` | Filter by exact category ID                                             |
| `submittedBy`    | `string` | Filter by username of the person who submitted the quote                |
| `submittedById`  | `number` | Filter by user ID who submitted the quote                               |
| `status`         | `string` | Filter by status (`APPROVED`, `PENDING`, `REJECTED`)                    |
| `language`       | `string` | Filter by language (e.g., `english`, `portuguese`)                      |

categories queries:

| Parameter        | Type     | Description                                                             |
|------------------|----------|-------------------------------------------------------------------------|
| `name`           | `string` | Filter by category name (partial or full match)                         |
| `id`             | `number` | Filter by category id                                                   |
| `status`         | `string` | Filter by status (`APPROVED`, `PENDING`, `REJECTED`)                    |

authors queries:

| Parameter        | Type     | Description                                                             |
|------------------|----------|-------------------------------------------------------------------------|
| `name`           | `string` | Search authors by name (partial or full match)                          |
| `id`             | `number` | Get a specific category by its ID                                       |
| `status`         | `string` | Filter by status (`APPROVED`, `PENDING`, `REJECTED`)                    |
| `qualifier`      | `string` | Filter by qualifier name if included (e.g., musician, french)           |

users queries:

| Parameter        | Type     | Description                                                             |
|------------------|----------|-------------------------------------------------------------------------|
| `username`       | `string` | Search users by username (partial or full match)                        |
| `id`             | `number` | Get a specific category by its ID                                       |
| `status`         | `string` | Filter by status (`APPROVED`, `PENDING`, `REJECTED`)                    |

### POST routes

#### All post routes have required and optional fields

Fields for `/quotes`:

| Parâmetro       | Type       | Description                                                 | Requirement   |
| --------------- | ---------- | ----------------------------------------------------------- | ------------- | 
| `content`       | `string`   | Quote text content                                          | Required      |
| `authorId`      | `number`   | Quote author ID                                             | Required      |
| `categoriesIds` | `number[]` | List of quote categories IDs                                | Required      | 
| `language`      | `string`   | Language of the quote (e.g., `portugues`, `english`)        | Required      |

Campos para `/categories`:

| Parâmetro       | Type       | Description                                                 | Requirement   |
| --------------- | ---------- | ----------------------------------------------------------- | ------------- | 
| `name`          | `string`   | Category name                                               | Required      |

Campos para `/authors`:

| Parâmetro       | Type       | Description                                                 | Requirement   |
| --------------- | ---------- | ----------------------------------------------------------- | ------------- | 
| `name`          | `string`   | Author Name                                                 | Required      |
| `qualifier`     | `string`   | qualifier for desambiguation (e.g., musician, french)       | Optional      |
| `imageUrl`      | `string`   | Author image URL                                            | Optional      | 


Campos para `/register`:

| Parâmetro       | Type       | Description                                                 | Requirement   |
| --------------- | ---------- | ----------------------------------------------------------- | ------------- | 
| `username`      | `string`   | Username for the new user                                   | Required      |
| `password`      | `string`   | Password for the new user                                   | Required      |


Campos para `/login`:

| Parâmetro       | Type       | Description                                                 | Requirement   |
| --------------- | ---------- | ----------------------------------------------------------- | ------------- | 
| `username`      | `string`   | Your username                                               | Required      |
| `password`      | `string`   | Your password                                               | Required      |


/users doesn't implement a `POST` route

---

## Structure

### API structure

```
once-said-api
├── prisma
│   ├── schema.prisma
│   ├── seed.ts // seeding script
│   └── seedData.json // data for seeding
├── src
│   ├── controllers
│   ├── middlewares
│   ├── lib
│   │   └── client.ts // Prisma client
│   ├── routes
│   ├── types
│   │   └── express
│   ├── utils
│   ├── app.ts
│   └── server.ts
├── .env
├── package.json
└── tsconfig.json
```

### Data structure

#### Quotes

| Field             | Type         | Description                                         |
| ----------------- | ------------ | --------------------------------------------------- |
| `id`              | `Int`        | Unique identifier (auto-incremented primary key)    |
| `content`         | `String`     | Quote text (must be unique)                         |
| `author`          | `Author`     | Object from `Author` table                          |
| `authorId`        | `Int`        | ID do author                                        |
| `categories`      | `Category[]` | List of objects from the `Categories` table         |
| `language`        | `String`     | Language of the quote                               |
| `status`          | `Status`     | Approval status (`APPROVED`, `PENDING`, `REJECTED`) |
| `createdAt`       | `DateTime`   | Creation date                                       |
| `submittedBy`     | `User?`      | Object from `Users` table                           |
| `submittedById`   | `Int?`       | Foreign key to `User` who submitted it (nullable)   |

#### Categories

| Field             | Type         | Description                                         |
| ----------------- | ------------ | ----------------------------------------------------|
| `id`              | `Int`        | Unique identifier (auto-incremented primary key)    |
| `name`            | `String`     | Name of the category (must be unique)               |
| `quotes`          | `Quote[]`    | Many-to-many relation with `Quote`                  |
| `status`          | `Status`     | Approval status (`APPROVED`, `PENDING`, `REJECTED`) |

#### Authors

| Field             | Type         | Description                                         |
| ----------------- | ------------ | --------------------------------------------------- |
| `id`              | `Int`        | Unique identifier (auto-incremented primary key)    |
| `name`            | `String`     | Author’s name                                       |
| `qualifier`       | `String?`    | Optional disambiguation (e.g., musician, french)    |
| `imageUrl`        | `String?`    | Optional image URL of the author                    |
| `quotes`          | `Quote[]`    | Many-to-many relation with `Category`               |
| `status`          | `Status`     | Approval status (`APPROVED`, `PENDING`, `REJECTED`) |

#### Users

| Field             | Type         | Description                                         |
| ----------------- | ------------ | --------------------------------------------------- |
| `id`              | `Int`        | Unique identifier (auto-incremented primary key)    |
| `username`        | `String`     | Unique username                                     |
| `password`        | `String`     | Hashed password                                     |
| `role`            | `UserRole`   | Role of the user (`USER`, `ADMIN`)                  |
| `createdAt`       | `DateTime`   | When the user was created (auto-set)                |
| `submittedQuotes` | `Quote[]`    | Quotes submitted by the user                        |
| `isDeleted`       | `Boolean`    | Soft delete flag (default is `false`)               |

---

## Near future improvements

- [ ] Deploy and example page
- [ ] Add pagination and sorting
- [x] Seeding
- [ ] Security improvements
- [ ] Improved feedback related to pending authors and categories
- [ ] Improved error handling
- [ ] Swagger/OpenAPI documentation

## Feedback and Contributions

I’m open to feedback, suggestions, or collaboration. Feel free to open an issue or pull request!

---

## License

This project is licensed under the MIT License.

---

## ⭐ About Me

This project is part of my learning journey in backend and frontend development, its objective was to create on my own a REST API by myself, following good practices and conventions. You can check out my other projects [here](https://github.com/derikchristian)!

---

## Quick Links

- 🔗 [GitHub Repository](https://github.com/derikchristian/once-said-api)





## Leia em Português

# Once Said API

Uma API REST rápida e simples que gerencia citações, autores, categorias e usuários e serve frases. Este projeto foi criado para ser simples de usar e facilitar a criação de citações ou implementações com frases tematizadas.

> ✅ Feito com **Node.js**, **TypeScript**, **Prisma**, **PostgreSQL** e **Express**, focando em arquitetura limpa, segurança de tipos e manutenção simples.

> ✅ Possui sistema de autenticação, filtragem de conteúdo, controle de acesso por função, tratamento de erros e sua principal funcionalidade é buscar citações específicas ou aleatórias com filtros.

## Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/derikchristian/once-said-api.git
cd once-said-api
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Crie um a arquivo `.env`

```env
DATABASE_URL=postgresql://seu_usuario:sua_senha@localhost:5432/sua_base_de_dados
JWT_SECRET=sua_chave_jwt
```

### 4. Crie as tabelas

```bash
npx prisma db push
```

### 5. Inicie o servidor

```bash
npm run dev
```

A API estará disponível em:
http://localhost:5000

---

## Rotas da API

### Autenticação

| Método | Rota                       | Descrição                    | Autenticação |
| ------ | -------------------------- | ---------------------------- | ------------ |
| POST   | `/authentication/register` | Registra um novo usuário     | Não requer   |
| POST   | `/authentication/login`    | Faz login e retorna um token | Não requer   |

### Usuários

| Método | Rota               | Descrição                          | Autenticação |
| ------ | ------------------ | ---------------------------------- | ------------ |
| GET    | `/users`           | Lista todos os usuários            | Opcional     |
| GET    | `/users/id`        | Busca um usuário pelo ID           | Opcional     |
| GET    | `/users/id/quotes` | Lista todas as citações do usuário | Opcional     |
| PATCH  | `/users/id`        | Atualiza os dados do usuário       | Requer       |
| DELETE | `/users/id`        | Deleta o usuário                   | Requer       |

### Citações (Quotes)

| Método | Rota             | Descrição                     | Autenticação |
| ------ | ---------------- | ----------------------------- | ------------ |
| GET    | `/quotes`        | Lista todas as citações       | Opcional     |
| GET    | `/quotes/id`     | Busca uma citação pelo ID     | Opcional     |
| GET    | `/quotes/random` | Retorna uma citação aleatória | Opcional     |
| POST   | `/quotes`        | Cria uma nova citação         | Requer       |
| PATCH  | `/quotes/id`     | Atualiza uma citação          | Requer       |
| DELETE | `/quotes/id`     | Deleta uma citação            | Requer       |

### Categorias

| Método | Rota                 | Descrição                            | Autenticação |
| ------ | -------------------- | ------------------------------------ | ------------ |
| GET    | `/categories`        | Lista todas as categorias            | Opcional     |
| GET    | `/categories/id`     | Busca uma categoria pelo ID          | Opcional     |
| GET    | `/categories/quotes` | Lista todas as citações da categoria | Opcional     |
| POST   | `/categories`        | Cria uma nova categoria              | Requer       |
| PATCH  | `/categories/id`     | Atualiza uma categoria               | Requer       |
| DELETE | `/categories/id`     | Deleta uma categoria                 | Requer       |

### Autores

| Método | Rota              | Descrição                        | Autenticação |
| ------ | ----------------- | -------------------------------- | ------------ |
| GET    | `/authors`        | Lista todos os autores           | Opcional     |
| GET    | `/authors/id`     | Busca um autor pelo ID           | Opcional     |
| GET    | `/authors/quotes` | Lista todas as citações do autor | Opcional     |
| POST   | `/authors`        | Cria um novo autor               | Requer       |
| PATCH  | `/authors/id`     | Atualiza um autor                | Requer       |
| DELETE | `/authors/id`     | Deleta um autor                  | Requer       |

### Exemplos de `GET quotes`

#### 1. GET `/quotes`

**Retorna todas as Frases**

#### Exemplo de Resposta

```json
{
  "success": true, // Para checar se o pedido teve exito
  "authenticated": false, // True se o usuário está autenticado
  "role": null, // Mostra o cargo caso o usuário esteja autenticado
  "data": [
    {
      "id": 9,
      "content": "Penso, logo existo.",
      "authorId": 12,
      "language": "portugues", // O campo language existe para que a mesma frase exista em diversos idiomas.
      "status": "APPROVED",
      "createdAt": "2025-06-06T20:17:30.787Z",
      "submittedById": 1,
      "categories": [
        {
          "id": 4,
          "name": "Filosofia"
        }
      ],
      "author": {
        "id": 12,
        "name": "René Descartes",
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg/800px-Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg"
      }
    },
    // ...Outras frases referentes a busca
  ]
}
```

#### 2. GET `/quotes/id` e `/quotes/random` com autenticação e cargo admin

**Retorna uma Frase**

```json
{
    "success": true,
    "authenticated": true,
    "role": "ADMIN",
    "data": {
        "id": 9,
        "content": "Penso, logo existo.",
        "authorId": 12,
        "language": "portuguese",
        "status": "PENDING",  // apenas administradores veem todas as frases "pending"
        "createdAt": "2025-06-06T20:17:30.787Z",
        "submittedById": 1,
        "author": {
            "id": 12,
            "name": "René Descartes",
            "qualifier": null,
            "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg/800px-Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg",
            "status": "PENDING"
        },
        "categories": [
            {
            "id": 4,
            "name": "Filosofia",
            "status": "PENDING"
            }
        ],
        "submittedBy": {
            "username": "Test1",
            "id": 1
        }
    }
}
```

**Categories, authors e users seguem a mesma estrutura.**

**A maioria das rotas `GET` também implementa filtros via query.**

Parâmetros para `/quotes` e `/quotes/random`:

| Parâmetro       | Tipo     | Descrição                                                   |
| --------------- | -------- | ----------------------------------------------------------- |
| `search`        | `string` | Filtra pelo conteúdo da frase (busca parcial ou completa)   | 
| `id`            | `number` | Filtra pelo ID da frase (não disponível em /random)         |
| `author`        | `string` | Filtra por nome do autor                                    |
| `authorId`      | `number` | Filtra por ID do autor                                      |
| `category`      | `string` | Filtra por nome da categoria                                | 
| `categoryId`    | `number` | Filtra por ID da categoria                                  |
| `submittedBy`   | `string` | Filtra por nome de usuário que enviou                       |
| `submittedById` | `number` | Filtra por ID do usuário que enviou                         |
| `status`        | `string` | Filtra por status (`APPROVED`, `PENDING`, `REJECTED`)       |
| `language`      | `string` | Filtra por idioma (e.g., `portugues`, `english`)            |

Parâmetros para `/categories`:

| Parâmetro       | Tipo     | Descrição                                                   |
| --------------- | -------- | ----------------------------------------------------------- |
| `name`          | `string` | Filtra pelo nome da categoria (busca parcial ou completa)   |
| `id`            | `number` | Filtra por ID da categoria                                  |
| `status`        | `string` | Filtra por status (`APPROVED`, `PENDING`, `REJECTED`)       |

Parâmetros para `/authors`:

| Parâmetro       | Tipo     | Descrição                                                   |
| --------------- | -------- | ----------------------------------------------------------- |
| `name`          | `string` | Filtra pelo nome do autor (busca parcial ou completa)       |
| `id`            | `number` | Filtra pelo ID do author                                    |
| `status`        | `string` | Filtra por status (`APPROVED`, `PENDING`, `REJECTED`)       |
| `qualifier`     | `string` | Filtra por qualificador se incluso (e.g., musician, french) |

Parâmetros para `/users`:

| Parâmetro       | Tipo     | Descrição                                                   |
| --------------- | -------- | ----------------------------------------------------------- |
| `username`      | `string` | Filtra pelo nome do usuário (busca parcial ou completa)     |
| `id`            | `number` | Filtra pelo ID do usuário                                   |
| `status`        | `string` | Filtra por status (`APPROVED`, `PENDING`, `REJECTED`)       |

### Rotas POST

#### Todas as rotas POST contém campos obrigatórios e opicionais

Campos para `/quotes`:

| Parâmetro       | Tipo       | Descrição                                                   | Exigência     |
| --------------- | ---------- | ----------------------------------------------------------- | ------------- | 
| `content`       | `string`   | Conteúdo textual da frase                                   | Obrigatório   |
| `authorId`      | `number`   | ID do autor da frase                                        | Obrigatório   |
| `categories`    | `number[]` | lista dos IDs das categorias da frase                       | Obrigatório   | 
| `language`      | `string`   | Idioma da frase (e.g., `portugues`, `english`)              | Obrigatório   |

Campos para `/categories`:

| Parâmetro       | Tipo       | Descrição                                                   | Exigência     |
| --------------- | ---------- | ----------------------------------------------------------- | ------------- | 
| `name`          | `string`   | Nome da categoria                                           | Obrigatório   |

Campos para `/authors`:

| Parâmetro       | Tipo       | Descrição                                                   | Exigência     |
| --------------- | ---------- | ----------------------------------------------------------- | ------------- | 
| `name`          | `string`   | Nome do autor                                               | Obrigatório   |
| `qualifier`     | `string`   | Qualificafor para desambiguação                             | Opcional      |
| `ImageUrl`      | `string`   | Url da imagem do autor                                      | Opcional      | 


Campos para `/register`:

| Parâmetro       | Tipo       | Descrição                                                   | Exigência     |
| --------------- | ---------- | ----------------------------------------------------------- | ------------- | 
| `username`      | `string`   | Nome do novo usuário                                        | Obrigatório   |
| `password`      | `string`   | Senha do novo usuário                                       | Obrigatório   |


Campos para `/login`:

| Parâmetro       | Tipo       | Descrição                                                   | Exigência     |
| --------------- | ---------- | ----------------------------------------------------------- | ------------- | 
| `username`      | `string`   | Seu nome de usuário                                         | Obrigatório   |
| `password`      | `string`   | Sua Senha                                                   | Obrigatório   |


/users não implementa uma rota `POST`

---

## Estrutura

### Estrutura da API

```
once-said-api
├── prisma
│   ├── schema.prisma
│   ├── seed.ts // script de inicialização dos dados
│   └── seedData.json // dados para inicialização
├── src
│   ├── controllers
│   ├── middlewares
│   ├── lib
│   │   └── client.ts // client Prisma
│   ├── routes
│   ├── types
│   │   └── express
│   ├── utils
│   ├── app.ts
│   └── server.ts
├── .env
├── package.json
└── tsconfig.json
```

### Estrutura dos Dados

#### Quotes

| Campo             | Tipo         | Descrição                                                      |
| ----------------- | ------------ | -------------------------------------------------------------- |
| `id`              | `number`     | Identificador único (chave primária auto-incrementada)         |
| `content`         | `string`     | Texto da frase (único)                                         |
| `author`          | `Author`     | Objeto da tabela `Authors`                                     |
| `authorId`        | `number`     | ID do autor                                                    |
| `categories`      | `Category[]` | Lista de objetos da tabela `Categories`                        |
| `language`        | `string`     | Idioma da frase                                                |
| `status`          | `string`     | Status da frase: `APPROVED`, `PENDING`, `REJECTED`             | 
| `createdAt`       | `DateTime`   | Data de criação                                                |
| `submittedBy`     | `User?`      | Objeto da tabela `Users` (possível null)                       |
| `submittedById`   | `number?`    | ID do usuário que enviou a frase (possível null)               |

#### Categories

| Campo             | Tipo         | Descrição                                                      |
| ----------------- | ------------ | -------------------------------------------------------------- |
| `id`              | `number`     | Identificador único (chave primária auto-incrementada)         |
| `name`            | `string`     | Nome da categoria                                              |
| `quotes`          | `Quote[]`    | Lista de objetos da tabela `Quotes`                            |
| `status`          | `string`     | Status da categoria: `APPROVED`, `PENDING`, `REJECTED`         | 

#### Authors

| Campo             | Tipo         | Descrição                                                      |
| ----------------- | ------------ | -------------------------------------------------------------- |
| `id`              | `number`     | Identificador único (chave primária auto-incrementada)         |
| `name`            | `string`     | Nome do author                                                 |
| `qualifier`       | `String?`    | desambiguação opcional (e.g., musician, french)                |
| `imageUrl`        | `string?`    | URL da imagem do autor                                         |
| `quotes`          | `Quote[]`    | Lista de objetos da tabela `Quotes`                            |
| `status`          | `string`     | Status do author: `APPROVED`, `PENDING`, `REJECTED`            |

#### Users

| Campo             | Tipo         | Descrição                                                      |
| ----------------- | ------------ | -------------------------------------------------------------- |
| `id`              | `number`     | Identificador único (chave primária auto-incrementada)         |
| `username`        | `string`     | Nome de usuário único                                          |
| `password`        | `string`     | Hash da senha                                                  |
| `role`            | `string`     | Cargo do usuário: (`USER`, `ADMIN`)                            | 
| `createdAt`       | `DateTime`   | Data de criação                                                |
| `submittedQuotes` | `Quote[]`    | Lista de objetos da tabela `Quotes`                            |
| `isDeleted`       | `Boolean`    | Indicador de soft delete (padrão e `false`)                    |

---

## Melhorias Futuras 

- [ ] Deploy e pagina de exemplo
- [ ] Paginação e Ordenamento
- [x] Dados iniciais
- [ ] Melhorias de segurança
- [ ] Melhorar o feedback relacionado e autores e categorias pendentes
- [ ] Tratamento de erros
- [ ] Documentação em Swagger/OpenAPI

## Feedback e contribuições

Estou aberto a sugestões, feedbacks ou colaborações. Sinta-se à vontade para abrir uma issue ou pull request!

---

## Licença

Este projeto está licenciado sob a Licença MIT.

---

## ⭐ About Me

Esse projeto e parte da minha jornada de aprendizado em desenvolvimento backend e frontend, o objetivo desse projeto era criar minha própria API REST por contra própria e seguindo boas práticas e convenções. Veja meus outros projetos [aqui](https://github.com/derikchristian)!

---

## Links

- 🔗 [Repositório GitHub](https://github.com/derikchristian/once-said-api)

