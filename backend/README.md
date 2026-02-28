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

API disponível em:

- `http://localhost:4000/graphql`

## Seed e DX

Scripts úteis para desenvolvimento:

```bash
npm run prisma:seed
npm run prisma:studio
npm run prisma:reset
```

- `prisma:seed`: popula dados iniciais para testes manuais
- `prisma:studio`: abre interface visual do banco
- `prisma:reset`: reseta o banco local e reaplica migrations

## Testes

```bash
npm test
```

## Validação manual da API

Para facilitar os testes no Playground/GraphiQL, use o kit em:

- `backend/docs/graphql-validation-kit.md`

## Fluxo de autenticação (JWT)

1. Execute `signup` ou `login` no GraphQL para obter o token JWT.
2. Envie o token no header `Authorization`:

```json
{
  "Authorization": "Bearer SEU_TOKEN_AQUI"
}
```

3. A partir disso, execute queries/mutations protegidas (`me`, `categories`, `transactions` e CRUDs).

## Estrutura do backend

- `src/server.ts`: bootstrap do servidor HTTP
- `src/app.ts`: factory da aplicação Express/Apollo (usada também em testes)
- `src/graphql/`: schema, context, resolvers e scalars
- `src/services/`: regras de negócio e acesso a dados
- `src/utils/`: validações e utilitários
- `prisma/`: schema, migrations e seed

## Checklist final da entrega (Backend)

- [x] TypeScript
- [x] GraphQL
- [x] Prisma
- [x] SQLite
- [x] CORS habilitado
- [x] `.env.example` com `JWT_SECRET` e `DATABASE_URL`
- [x] Autenticação (`signup` e `login`)
- [x] CRUD de categorias
- [x] CRUD de transações
- [x] Isolamento de dados por usuário autenticado
