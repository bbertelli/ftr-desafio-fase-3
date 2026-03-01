import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const backendUrl =
  import.meta.env.VITE_BACKEND_URL ?? "http://localhost:4000/graphql";

export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: backendUrl,
  }),
  cache: new InMemoryCache(),
});
