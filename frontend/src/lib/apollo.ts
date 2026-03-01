import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";

import { getAuthToken } from "./auth";

const backendUrl =
  import.meta.env.VITE_BACKEND_URL ?? "http://localhost:4000/graphql";

const httpLink = new HttpLink({
  uri: backendUrl,
});

const authLink = new ApolloLink((operation, forward) => {
  const token = getAuthToken();

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  }));

  return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
