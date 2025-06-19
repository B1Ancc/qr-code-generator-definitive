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

export default function ListPage() {
  return (
    <Page
      title="QR Codes List"
      subtitle="QR codes you created will be shown up here."
      backAction={{ content: 'Generator', url: '../' }}
    >
      <TitleBar title="Your QR codes" />
      <Card>
        <EmptyState
          heading="Start creating your first QR code!"
          action={{ content: 'Add a QR code', url: '../' }}
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        >
        <p>QR codes you created will be shown up here.</p>
        </EmptyState>
      </Card>
    </Page>
  );
}
