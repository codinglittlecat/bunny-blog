import React from "react";
import type { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/react-hooks";
import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import "react-toastify/dist/ReactToastify.css";

import { ToastContainer } from "react-toastify";

import Layout from "../components/layout";
import "../styles/globals.css";

const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql",
});

let token: any = null;

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <ToastContainer />
    </ApolloProvider>
  );
}

export default MyApp;
