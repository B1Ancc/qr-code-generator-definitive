import { BlockStack, Card, DataTable, Divider, FooterHelp, Grid, InlineStack, Link, Page, Text } from "@shopify/polaris";
import Footer from "./components/Footer";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import db from "../db.server"

export const loader = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    const { shop } = session;
    const data = await db.qRCode.findMany(
        {
            take: 5,
            orderBy: {
                createdAt: 'desc'
            },
            where: { shop },
            select: {
                title: true,
                endpoint: true,
                type: true,
                createdAt: true,
            }
        }
    );
    return data ?? null;
};

export default function Home() {
    const rows = useLoaderData();
    const row = rows.map(({ title, endpoint, type, createdAt }) => {
        const date = new Date(createdAt);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

        return [title, endpoint, type, formattedDate];
    });

    return (
        <>
            <Page title="QR Codes Generator Definitive" subtitle="Create a QR code instantly. Access them whenever you want, wherever you go.">
                <BlockStack gap="200">
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
                                'Endpoint',
                                'Type',
                                'Created at',
                            ]}

                            rows={row}
                        >
                        </DataTable>
                    </Card>
                    <Grid columns={3}>
                        <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }}>
                            <Card>
                                <InlineStack align="center">
                                    <img src="/assets/qr-type/dots.png" width="100%" height="100%" objectFit="contain"></img>
                                    <Divider />
                                    <Link url="/app/static">Create a QR code</Link>
                                </InlineStack>
                            </Card>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }}>
                            <Card>
                                <Link url="/app/list">See your QR codes</Link>
                            </Card>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }}>
                            <Card>
                                <Link url="/app/settings">Settings</Link>
                            </Card>
                        </Grid.Cell>
                    </Grid>
                </BlockStack>
                <Footer />
            </Page>
        </>
    )
}