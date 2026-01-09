import {
    Page,
    BlockStack,
    Card,
    EmptyState,
    Text
} from "@shopify/polaris";
import Footer from "./components/Footer";

export default function DynamicLayout() {
    return (
        <Page>
            <Card>
                <EmptyState
                    heading="This is still in development!"
                    action={{ content: 'Go to home', url: '/app/home' }}
                >
                    <Text>Sorry, this function has yet to be available. In the meantime you could try create static QR codes instead.</Text>
                </EmptyState>
            </Card>
        </Page>
    );
}

