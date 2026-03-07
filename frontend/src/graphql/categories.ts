import { gql } from "@apollo/client";

export const GET_CATEGORIES_QUERY = gql`
  query GetCategories {
    categories {
      id
      name
      createdAt
      updatedAt
    }
  }
`;

export const GET_TRANSACTIONS_FOR_CATEGORY_STATS_QUERY = gql`
  query GetTransactionsForCategoryStats {
    transactions {
      id
      amount
      categoryId
    }
  }
`;

export const CREATE_CATEGORY_MUTATION = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_CATEGORY_MUTATION = gql`
  mutation UpdateCategory($input: UpdateCategoryInput!) {
    updateCategory(input: $input) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_CATEGORY_MUTATION = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;
