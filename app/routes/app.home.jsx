<<<<<<< HEAD
import { BlockStack, Card, DataTable, FooterHelp, Grid, InlineGrid, InlineStack, Page, Text } from "@shopify/polaris";
=======
import { Card, DataTable, FooterHelp, Page, Text } from "@shopify/polaris";
>>>>>>> develop
import Footer from "./components/Footer";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import db from "../db.server"

export const loader = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    const { shop } = session;
    const data = await db.qRCode.findMany(
        {
<<<<<<< HEAD
            take: 5,
            orderBy: {
                createdAt: 'desc',
            },
            where: { shop },
            select: {
                title: true,
                endpoint: true,
                type: true,
=======
            where: { shop },
            select: {
                title: true,
                destination: true,
                pattern: true,
>>>>>>> develop
                createdAt: true,
            }
        }
    );
    return data ?? null;
};

export default function Home() {
    const rows = useLoaderData();
<<<<<<< HEAD
    const row = rows.map(({ title, endpoint, createdAt }) => {
        const date = new Date(createdAt);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    
        return [title, endpoint, formattedDate];
    }
    );
=======
    const row = rows.map((single) => [single.title, single.destination, single.pattern, single.createdAt]);
>>>>>>> develop

    return (
        <>
            <Page title="QR Codes Generator Definitive" subtitle="Create a QR code instantly. Access them whenever you want, wherever you go.">
<<<<<<< HEAD
                <BlockStack gap="500">
                    <Card>
                        <Text variant="headingMd" as="h6">
                            Recent created QR codes
                        </Text>
                        <DataTable
                            columnContentTypes={[
                                'text',
                                'text',
                                'text',
                            ]}
                            headings={[
                                'Name',
                                'Destination',
                                'Created at',
                            ]}

                            rows={row}
                        >
                        </DataTable>
                    </Card>
                    <InlineGrid gap="100" alignItems="center">
                        <Text fontWeight="headingLg" as="h5">
                            Not sure what to do next?
                        </Text>
                        <Text fontWeight="bodyLg" as="p">
                            Here's a random quote of the day for you!
                        </Text>
                    </InlineGrid>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }}>
                            <Card>
                                Static QR
                            </Card>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }}>
                            <Card>
                                Dynamic QR
                            </Card>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }}>
                            <Card>
                                Settings
                            </Card>
                        </Grid.Cell>
                    </Grid>
                </BlockStack>
=======
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
>>>>>>> develop
                <Footer />
            </Page>
        </>
    )
}