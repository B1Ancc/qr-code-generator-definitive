import { BlockStack, Button, Card, DataTable, Divider, FooterHelp, Grid, InlineStack, Link, Page, Text } from "@shopify/polaris";
import Footer from "./components/Footer";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import db from "../db.server"
import { useState } from "react";
import { dateTimeFormat } from "./utils/dateTimeFormat";

export const loader = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    const { shop } = session;
    const rows = await db.qRCode.findMany(
        {
            take: 5,
            orderBy: {
                createdAt: 'desc'
            },
            where: {
                shop,
                isDeleted: false,
            },
            select: {
                title: true,
                endpoint: true,
                type: true,
                createdAt: true,
            }
        }
    );
    const settingsData = await db.settings.findFirst(
        {
            where: {
                shop
            },
            select: {
                timeFormat: true,
                hourFormat: true,
                dateFormat: true,
                dateStringFormat: true,
            }
        }
    );
    const settings = {
        timeFormat: settingsData ? settingsData.timeFormat : "short",
        hourFormat: settingsData ? settingsData.hourFormat : "12h",
        dateFormat: settingsData ? settingsData.dateFormat : "dmy",
        dateStringFormat: settingsData ? settingsData.dateStringFormat : "short",
    }
    return {
        rows,
        settings,
    };
};



export default function Home() {
    const [isHovered, setIsHovered] = useState(false);
    const buttonStyle = {
        color: 'white',
        border: 'none',
        width: '80%',
        height: '80%',
    };
    const { rows, settings } = useLoaderData();
    const row = rows.map(({ title, endpoint, type, createdAt }) => {
        const date = new Date(createdAt);
        const formattedDate = dateTimeFormat(date, settings);
        const formattedTitle = title.length >= 28 ? `${title.slice(0, 28)}...` : title;
        return [formattedTitle, endpoint, type, formattedDate];
    });

    return (
        <>
            <Page title="QR Codes Generator Definitive" subtitle="Create a QR code instantly. Access them whenever you want, wherever you go.">
                <BlockStack gap="200">
                {row ?
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
                                'Last modified',
                            ]}

                            rows={row}
                        >
                        </DataTable>
                    </Card> : <Text></Text>
                    }
                    <Grid columns={3}>
                        <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }}>
                            <Card>
                                <BlockStack inlineAlign="center" gap="100">
                                    <img
                                        style={buttonStyle}
                                        src="/assets/menu-options/create.png"
                                    />
                                    <Divider />
                                    <Button url="/app/static">Create a QR code</Button>
                                </BlockStack>
                            </Card>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }}>
                            <Card>
                                <BlockStack inlineAlign="center" gap="100">
                                    <img
                                        style={buttonStyle}
                                        src="/assets/menu-options/list.png"
                                    />
                                    <Divider />
                                    <Button url="/app/list">View your QR codes' list</Button>
                                </BlockStack>
                            </Card>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }}>
                            <Card>
                                <BlockStack inlineAlign="center" gap="100">
                                    <img
                                        style={buttonStyle}
                                        src="/assets/menu-options/settings.png"
                                    />
                                    <Divider />
                                    <Button url="/app/settings">Settings</Button>
                                </BlockStack>
                            </Card>
                        </Grid.Cell>
                    </Grid>
                </BlockStack>
                <Footer />
            </Page>
        </>
    )
}