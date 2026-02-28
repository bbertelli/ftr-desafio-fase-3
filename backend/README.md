# Financy - Backend

Nesse projeto back-end, será desenvolvida uma API para gerenciar a organização das finanças.

Para esse desafio é esperado o uso do banco de dados **SQLite**.

## Progresso do projeto

### Funcionalidades e regras

- [x] O usuário pode criar uma conta e fazer login
- [x] O usuário pode ver e gerenciar apenas as transações e categorias criadas por ele
- [x] Deve ser possível criar uma transação
- [x] Deve ser possível deletar uma transação
- [x] Deve ser possível editar uma transação
- [x] Deve ser possível listar todas as transações
- [x] Deve ser possível criar uma categoria
- [x] Deve ser possível deletar uma categoria
- [x] Deve ser possível editar uma categoria
- [x] Deve ser possível listar todas as categorias

### Setup inicial (base técnica)

- [x] Projeto backend inicializado com Node.js + TypeScript
- [x] Servidor GraphQL configurado
- [x] Prisma configurado com SQLite
- [x] Arquivo `.env.example` criado com `JWT_SECRET` e `DATABASE_URL`
- [x] CORS habilitado na aplicação

## Ferramentas obrigatórias

- TypeScript
- GraphQL
- Prisma
- SQLite

## Variáveis de ambiente

É obrigatório que o projeto tenha um arquivo **.env.example** com as chaves necessárias. Copie para `.env` e preencha os valores.

- `JWT_SECRET=`
- `DATABASE_URL=`

Caso adicione variáveis adicionais, inclua-as no .env.example.

## Observações importantes

- Seguir todos os requisitos obrigatórios, principalmente os relacionados às tecnologias (GraphQL).
- Habilitar **CORS** na aplicação.

## Como rodar

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```
