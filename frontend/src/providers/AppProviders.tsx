import { ApolloProvider } from "@apollo/client/react";
import type { ReactNode } from "react";

import { apolloClient } from "../lib/apollo";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
