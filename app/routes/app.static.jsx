import {
  Page,
  BlockStack,
} from "@shopify/polaris";
import Footer from "./components/Footer";
import { QRTargetProvider } from "./contexts/QRTargetContext";
import { QRCustomizationsProvider } from "./contexts/QRCustomizationsContext";
import { QRSettingsProvider } from "./contexts/QRSettingsContext";
import { Outlet } from "@remix-run/react";

export default function StaticLayout() {
  return (
    <QRTargetProvider>
      <QRSettingsProvider>
        <QRCustomizationsProvider>
          <Page title="Static QR Codes Generator" subtitle="Create a QR code instantly (without trackers).">
            <BlockStack gap="200">
              <Outlet />
            </BlockStack>
          </Page >
          <Footer />
        </QRCustomizationsProvider>
      </QRSettingsProvider>
    </QRTargetProvider>
  );
}
