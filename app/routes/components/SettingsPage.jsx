import {
    BlockStack,
    Divider,
    InlineStack,
    Text,
} from "@shopify/polaris";
import SettingsDateTime from "./SettingsDateTime";
import SettingsSaveBar from "./SettingsSaveBar";
import SettingsColors from "./SettingsColors";

export default function SettingsPage({ settingsData }) {
    return (
        <BlockStack gap="200">
            <SettingsSaveBar settingsSaveData={settingsData} />
            <Text variant="headingLg" fontWeight="bold" as="h2">Interface settings</Text>
            <Divider borderColor="border" />
            <InlineStack align="center">
                <Text variant="headingMd" fontWeight="bold" as="h3">Currently in development!{settingsData.actionData?.success}</Text>
            </InlineStack>
            <Text variant="headingLg" fontWeight="bold" as="h2">Data settings</Text>
            <Divider borderColor="border" />
            <SettingsColors colorSettingsData={settingsData} />
            <SettingsDateTime dateTimeSettingsData={settingsData} category="time" />
            <SettingsDateTime dateTimeSettingsData={settingsData} category="date" />
        </BlockStack>
    );
}
