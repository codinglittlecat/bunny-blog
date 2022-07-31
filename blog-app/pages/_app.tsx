import React from "react";
import type { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/react-hooks";
import "react-toastify/dist/ReactToastify.css";

import { ToastContainer } from "react-toastify";

import Layout from "../components/layout";
import "../styles/globals.css";
import client from "../utils/apollo-client";

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
