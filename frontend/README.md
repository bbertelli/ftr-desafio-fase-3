# Financy - Frontend

Aplicação React para gerenciamento de finanças, consumindo a API GraphQL do backend.

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

### Páginas e UI
- [ ] Página raiz (/) — login quando deslogado, dashboard quando logado
- [ ] Demais páginas e modais conforme Figma

### Regras
- [ ] Usuário vê e gerencia apenas suas próprias transações e categorias
- [ ] Layout seguindo o mais fielmente possível o Figma

## Ferramentas obrigatórias

- TypeScript
- React
- Vite (sem framework)
- GraphQL

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

- `VITE_BACKEND_URL` — URL base da API (ex: `http://localhost:4000`)

## Como rodar

```bash
npm install
npm run dev
```
