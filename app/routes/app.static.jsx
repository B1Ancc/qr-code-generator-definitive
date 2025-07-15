import {
  Page,
  BlockStack,
} from "@shopify/polaris";
import Footer from "./components/Footer";
import { TargetProvider } from "./contexts/QRTargetContext";
import { CustomizationProvider } from "./contexts/QRCustomizationsContext";
import { SettingsProvider } from "./contexts/QRSettingsContext";
import { Outlet } from "@remix-run/react";

export default function StaticLayout() {
  return (
    <TargetProvider>
      <SettingsProvider>
        <CustomizationProvider>
          <Page title="Static QR Codes Generator" subtitle="Create a QR code instantly (without trackers).">
            <BlockStack gap="200">
              <Outlet />
            </BlockStack>
          </Page >
          <Footer />
        </CustomizationProvider>
      </SettingsProvider>
    </TargetProvider>
  );
}
