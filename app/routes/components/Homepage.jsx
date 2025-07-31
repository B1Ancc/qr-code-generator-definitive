import {
    BlockStack,
} from "@shopify/polaris";
import QRSettings from "./QRSettings";
import QRCustomizations from "./QRCustomizations";
import QRTarget from "./QRTarget";
import GlobalSaveBar from "./GlobalSaveBar";

export default function Homepage({ qrData }) {
    return (
        <BlockStack gap="200">
            <GlobalSaveBar saveData={qrData}/>
            <QRTarget />
            <QRSettings settingsData={qrData} />
            <QRCustomizations customData={qrData} />
        </BlockStack>
    );
}
