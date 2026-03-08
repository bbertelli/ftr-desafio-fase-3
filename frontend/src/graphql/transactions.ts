import { gql } from "@apollo/client";

export const GET_TRANSACTIONS_QUERY = gql`
  query GetTransactions {
    transactions {
      id
      title
      amount
      type
      date
      notes
      categoryId
      createdAt
      updatedAt
      category {
        id
        name
        icon
        color
      }
    }
  }
`;

export const CREATE_TRANSACTION_MUTATION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      id
      title
      amount
      type
      date
      notes
      categoryId
      createdAt
      updatedAt
      category {
        id
        name
        icon
        color
      }
    }
  }
`;

export const UPDATE_TRANSACTION_MUTATION = gql`
  mutation UpdateTransaction($input: UpdateTransactionInput!) {
    updateTransaction(input: $input) {
      id
      title
      amount
      type
      date
      notes
      categoryId
      createdAt
      updatedAt
      category {
        id
        name
        icon
        color
      }
    }
  }
`;

export const DELETE_TRANSACTION_MUTATION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`;
