import { Card, DataTable, FooterHelp, Page, Text } from "@shopify/polaris";
import Footer from "./components/Footer";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import db from "../db.server"

export const loader = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    const { shop } = session;
    const data = await db.qRCode.findMany(
        {
            where: { shop },
            select: {
                title: true,
                destination: true,
                pattern: true,
                createdAt: true,
            }
        }
    );
    return data ?? null;
};

export default function Home() {
    const rows = useLoaderData();
    const row = rows.map((single) => [single.title, single.destination, single.pattern, single.createdAt]);

    return (
        <>
            <Page title="QR Codes Generator Definitive" subtitle="Create a QR code instantly. Access them whenever you want, wherever you go.">
                <Card>
                    <Text variant="headingMd" as="h6">
                        Recent created QR codes
                    </Text>
                    <DataTable
                        columnContentTypes={[
                            'text',
                            'text',
                            'text',
                            'text'
                        ]}
                        headings={[
                            'Name',
                            'Destination',
                            'Type',
                            'Scans',
                        ]}

                        rows={row}
                    >
                    </DataTable>
                </Card>
                <Footer />
            </Page>
        </>
    )
}