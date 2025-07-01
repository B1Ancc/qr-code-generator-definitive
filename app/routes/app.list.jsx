import {
  Box,
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  BlockStack,
  EmptyState,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import Footer from "./components/Footer";
import db from "../db.server"
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";

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

export default function ListPage() {
  const dataList = useLoaderData();

  return (
    <Page
      title="QR Codes List"
      subtitle="QR codes you created will be shown up here."
      backAction={{ content: 'Generator', url: '../' }}
    >
      <TitleBar title="Your QR codes" />
      <Card>
        {dataList ?
          <Text>Mẹ mày béo</Text>
          :
          <EmptyState
            heading="Start creating your first QR code!"
            action={{ content: 'Add a QR code', url: '../static' }}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>QR codes you created will be shown up here.</p>
          </EmptyState>}
      </Card>
      <Footer />
    </Page>
  );
}
