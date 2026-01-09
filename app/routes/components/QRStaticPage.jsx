import {
    BlockStack,
    Button,
    Grid,
    Page,
} from "@shopify/polaris";
import QRSettings from "./QRSettings";
import QRCustomizations from "./QRCustomizations";
import QRTarget from "./QRTarget";
import GlobalSaveBar from "./QRSaveBar";
import QRCard from "./QRCard";

export default function QRStaticPage({ qrData }) {
    return (
        <Grid>
            <Grid.Cell columnSpan={{ xs: 8, sm: 4, md: 4, lg: 8, xl: 8 }}>
                <BlockStack gap="200">
                    <GlobalSaveBar saveData={qrData} />
                    <QRTarget targetData={qrData} />
                    <QRSettings settingsData={qrData} />
                    <QRCustomizations customData={qrData} />
                </BlockStack>
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }}>
                <QRCard />
            </Grid.Cell>
        </Grid>
    );
}
