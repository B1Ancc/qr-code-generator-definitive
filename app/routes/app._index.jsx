import { useState } from "react";
import {
  Page,
  BlockStack,
  Grid,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import Homepage from "./components/Homepage";
import QRCard from "./components/QRCard";
import { SelectedProvider } from "./contexts/SelectedContext";

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

  return (
    <SelectedProvider>
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
    </SelectedProvider>
  );
}
