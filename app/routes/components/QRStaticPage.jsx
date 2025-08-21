import {
    BlockStack,
} from "@shopify/polaris";
import QRSettings from "./QRSettings";
import QRCustomizations from "./QRCustomizations";
import QRTarget from "./QRTarget";
import GlobalSaveBar from "./GlobalSaveBar";

export default function QRStaticPage({ qrData }) {
    return (
        <BlockStack gap="200">
            <GlobalSaveBar saveData={qrData}/>
            <QRTarget targetData={qrData}/>
            <QRSettings settingsData={qrData} />
            <QRCustomizations customData={qrData} />
        </BlockStack>
    );
}
