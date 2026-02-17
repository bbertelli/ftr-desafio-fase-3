# Financy - Frontend

Nesse projeto front-end será desenvolvida uma aplicação React que, em conjunto com a API, permite o gerenciamento de transações e categorias.

## Progresso do projeto

### Funcionalidades e regras (comuns à API)

- [ ] O usuário pode criar uma conta e fazer login
- [ ] O usuário pode ver e gerenciar apenas as transações e categorias criadas por ele
- [ ] Deve ser possível criar uma transação
- [ ] Deve ser possível deletar uma transação
- [ ] Deve ser possível editar uma transação
- [ ] Deve ser possível listar todas as transações
- [ ] Deve ser possível criar uma categoria
- [ ] Deve ser possível deletar uma categoria
- [ ] Deve ser possível editar uma categoria
- [ ] Deve ser possível listar todas as categorias

### Regras específicas do front-end

- [ ] Aplicação React usando **GraphQL** para consultas na API e **Vite** como bundler
- [ ] Seguir o mais fielmente possível o layout do **Figma**

### Páginas e UI

A aplicação possui **6 páginas** e **dois modais** com os formulários (Dialog):

- [ ] Página raiz (**/**):
  - Tela de login caso o usuário esteja deslogado
  - Tela dashboard caso o usuário esteja logado
- [ ] Demais páginas e modais conforme Figma

## Ferramentas obrigatórias

- TypeScript
- React
- Vite sem framework
- GraphQL

## Ferramentas de uso flexível

- TailwindCSS
- Shadcn
- React Query
- React Hook Form
- Zod

## Variáveis de ambiente

É obrigatório que o projeto tenha um arquivo **.env.example** com as chaves necessárias. Copie para `.env` e preencha.

- `VITE_BACKEND_URL=`

## Observações importantes

- Começar o projeto pela aba **Style Guide** no Figma (tema, fontes e componentes), para facilitar a criação das páginas.
- Recomenda-se utilizar bibliotecas que facilitem o desenvolvimento e a manutenção (DX).

## Como rodar

```bash
npm install
npm run dev
```
