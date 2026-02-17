# Financy - Backend

API para gerenciamento de finanças (transações e categorias). Desenvolvida com TypeScript, GraphQL, Prisma e SQLite.

## Progresso do projeto

### Autenticação
- [ ] O usuário pode criar uma conta
- [ ] O usuário pode fazer login

### Transações
- [ ] Criar uma transação
- [ ] Deletar uma transação
- [ ] Editar uma transação
- [ ] Listar todas as transações (apenas as do usuário logado)

### Categorias
- [ ] Criar uma categoria
- [ ] Deletar uma categoria
- [ ] Editar uma categoria
- [ ] Listar todas as categorias (apenas as do usuário logado)

### Regras
- [ ] Usuário vê e gerencia apenas suas próprias transações e categorias

## Ferramentas obrigatórias

- TypeScript
- GraphQL
- Prisma
- SQLite

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha os valores:

- `JWT_SECRET` — Chave secreta para assinatura do token JWT
- `DATABASE_URL` — URL de conexão com o SQLite (ex: `file:./dev.db`)

## Como rodar

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```
