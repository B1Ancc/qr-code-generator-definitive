// 

import { TitleBar } from "@shopify/app-bridge-react";
import { ActionList, BlockStack, Button, Card, Divider, InlineStack, Page, Popover, Text } from "@shopify/polaris";
import { useCallback, useState } from "react";

export default function SettingsPage() {
    const dateFormats = ['DD-MM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD', 'YYYY-DD-MM'];
    const timeFormats = ['12-hour', '24-hour'];
    const [currentDateFormat, setCurrentDateFormat] = useState("DD-MM-YYYY");
    const [currentTimeFormat, setCurrentTimeFormat] = useState("24-hour");
    const [visible, setVisible] = useState(false);

    const handleDateFormat = useCallback(
        (newDateFormat) => {
            setCurrentDateFormat(newDateFormat);
            setVisible(false);
        },
        [],
    );

    const handleTimeFormat = useCallback(
        (newTimeFormat) => {
            setCurrentTimeFormat(newTimeFormat);
            setVisible(false);
        },
        [],
    );

    return (
        <Page
            title="Settings"
            subtitle=""
            backAction={{ content: 'Generator', url: '../' }}
        >
            <TitleBar title="Settings" />
            <Card>
                {/* <Text variant="headingMd" as="h6">
                    Date & time settings
                </Text> */}
                <BlockStack gap="400">
                    <InlineStack align="space-between">
                        <BlockStack gap="4">
                            <Text variant="headingMd" as="h6">Date format</Text>
                            <Text variant="bodyMd" as="p">Configure how you see the date displays.</Text>
                        </BlockStack>
                        <Popover
                            active={visible}
                            activator={
                                <Button onClick={() => setVisible(true)} disclosure>
                                    {currentDateFormat}
                                </Button>
                            }
                            autofocusTarget="first-node"
                            onClose={() => setVisible(false)}
                        >
                            <ActionList
                                actionRole="menuitem"
                                items={dateFormats.map((dateFormat) => ({
                                    content: dateFormat,
                                    onAction: () => handleDateFormat(dateFormat),
                                }))}
                            />
                        </Popover>
                    </InlineStack>
                    <InlineStack align="space-between">
                        <BlockStack gap="4">
                            <Text variant="headingMd" as="h6">Time format</Text>
                            <Text variant="bodyMd" as="p">Configure how you see the time displays.</Text>
                        </BlockStack>
                        <Popover
                            active={visible}
                            activator={
                                <Button onClick={() => setVisible(true)} disclosure>
                                    {currentTimeFormat}
                                </Button>
                            }
                            autofocusTarget="first-node"
                            onClose={() => setVisible(false)}
                        >
                            <ActionList
                                actionRole="menuitem"
                                items={timeFormats.map((timeFormat) => ({
                                    content: timeFormat,
                                    onAction: () => handleTimeFormat(timeFormat),
                                }))}
                            />
                        </Popover>
                    </InlineStack>
                </BlockStack>
            </Card>
        </Page >
    )
}