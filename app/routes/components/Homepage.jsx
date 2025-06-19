import {
    BlockStack,
} from "@shopify/polaris";
import QRSettings from "./QRSettings";
import QRCustomizations from "./QRCustomizations";
import QRTarget from "./QRTarget";

export default function Homepage() {
    return (
        <BlockStack gap="200">
            <QRTarget />
            <QRSettings />
            <QRCustomizations />
        </BlockStack>
    );
}
