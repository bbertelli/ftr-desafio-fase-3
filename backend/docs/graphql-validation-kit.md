# Kit rápido de validação GraphQL (Backend)

Este guia ajuda a validar rapidamente os fluxos principais da API no Playground/GraphiQL.

Endpoint padrão:

`http://localhost:4000/graphql`

## 1) Criar conta (signup)

```graphql
mutation Signup {
  signup(
    input: {
      name: "Bruno"
      email: "bruno@example.com"
      password: "123456"
    }
  ) {
    token
    user {
      id
      name
      email
    }
  }
}
```

## 2) Login

```graphql
mutation Login {
  login(
    input: {
      email: "bruno@example.com"
      password: "123456"
    }
  ) {
    token
    user {
      id
      name
      email
    }
  }
}
```

## 3) Configurar autenticação no header

Use o token retornado no `signup` ou `login`:

```json
{
  "Authorization": "Bearer SEU_TOKEN_AQUI"
}
```

## 4) Criar categoria

```graphql
mutation CreateCategory {
  createCategory(input: { name: "Food" }) {
    id
    name
  }
}
```

## 5) Listar categorias

```graphql
query ListCategories {
  categories {
    id
    name
  }
}
```

## 6) Criar transação

Substitua `ID_DA_CATEGORIA` por um ID válido criado anteriormente.

```graphql
mutation CreateTransaction {
  createTransaction(
    input: {
      title: "Lunch"
      amount: 35.5
      type: EXPENSE
      date: "2026-02-28T12:30:00.000Z"
      notes: "Workday"
      categoryId: "ID_DA_CATEGORIA"
    }
  ) {
    id
    title
    amount
    type
    date
    category {
      id
      name
    }
  }
}
```

## 7) Listar transações

```graphql
query ListTransactions {
  transactions {
    id
    title
    amount
    type
    date
    notes
    category {
      id
      name
    }
  }
}
```

## 8) Editar categoria

```graphql
mutation UpdateCategory {
  updateCategory(input: { id: "ID_DA_CATEGORIA", name: "Groceries" }) {
    id
    name
  }
}
```

## 9) Deletar categoria

```graphql
mutation DeleteCategory {
  deleteCategory(id: "ID_DA_CATEGORIA")
}
```

## 10) Editar transação

```graphql
mutation UpdateTransaction {
  updateTransaction(
    input: {
      id: "ID_DA_TRANSACAO"
      title: "Lunch with client"
      amount: 48.9
      notes: "Updated"
    }
  ) {
    id
    title
    amount
    notes
  }
}
```

## 11) Deletar transação

```graphql
mutation DeleteTransaction {
  deleteTransaction(id: "ID_DA_TRANSACAO")
}
```
