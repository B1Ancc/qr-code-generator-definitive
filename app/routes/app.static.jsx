import { useState } from "react";
import {
  Page,
  BlockStack,
  Grid,
  Card,
  Text,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import Homepage from "./components/Homepage";
import QRCard from "./components/QRCard";
import Footer from "./components/Footer";
import { redirect, useLoaderData } from "@remix-run/react";
import { v4 as uuidv4 } from 'uuid';
import db from "../db.server"
import { TargetProvider } from "./contexts/TargetContext";
import { CustomizationProvider } from "./contexts/CustomizationContext";
import { SettingsProvider } from "./contexts/SettingsContext";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;
  const data = await db.qRCode.findMany(
    {
      where: { shop },
      select: {
        id: true,
        title: true
      }
    }
  );
  return data ?? null;
};

export const action = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const uniqueId = uuidv4();

  const data = {
    ...Object.fromEntries(await request.formData()),
    shop,
    id: uniqueId,
  };

  const createQRCode = await db.qRCode.create({ data });

  return null;
}

export default function Static() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <TargetProvider>
      <SettingsProvider>
        <CustomizationProvider>
          <Page title="Static QR Codes Generator" subtitle="Create a QR code instantly (without trackers).">
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
          <Footer />
        </CustomizationProvider>
      </SettingsProvider>
    </TargetProvider>
  );
}
