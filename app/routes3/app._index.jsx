import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  Grid,
  TextField,
  FormLayout,
  Tooltip,
  Select,
  Spinner,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import Homepage from "./components/Homepage";
import QRCard from "./components/QRCard";
import QRSettings from "./components/QRSettings";
import QRCustomizations from "./components/QRCustomizations";
import QRTarget from "./components/QRTarget";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const responseJson = await response.json();
}

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);

  // const renderSelected = (x) => {
  //   switch (x) {
  //     case "homepage":
  //       return <Homepage />;
  //     case "product_page":
  //       return <ProductPage />;
  //     case "cart":
  //       return <AddToCart />;
  //     case "custom_url":
  //       return null;
  //     case "mobile_app":
  //       return null;
  //     case "sqr":
  //       return setSelected("homepage");
  //     case "iqr":
  //       return setSelected("custom_url");
  //     default:
  //       return <p>There's nothing to see here... Or is it?</p>;
  //   }
  // }

  return (
    <SelectedContextProvider>
      <Page title="QR Codes Generator" subtitle="Create a QR code instantly. Access them whenever you want, wherever you go.">
        <BlockStack gap="200">
          <Grid>
            <Grid.Cell columnSpan={{ xs: 8, sm: 4, md: 4, lg: 8, xl: 8 }}>
              <Homepage />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }}>
              <QRCard />
            </Grid.Cell>
          </Grid>
        </BlockStack>
      </Page >
    </SelectedContextProvider>
  );
}
