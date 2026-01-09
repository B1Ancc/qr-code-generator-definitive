import { useContext, useState, useEffect, useRef, useCallback } from "react";
import { BlockStack, Box, Card, ColorPicker, Divider, Grid, hsbToHex, InlineStack, Page, Popover, Select, Text, TextField } from "@shopify/polaris";
import QRCustomizationsContext from "../contexts/QRCustomizationsContext";
import { useQRLoadingContext } from "../contexts/QRLoadingContext";
import GlobalStyles from "../styles/GlobalStyles.module.css";

export default function SettingsColors({ colorSettingsData }) {
    const [visible, setVisible] = useState(false);
    const qrCustomizationsContext = useContext(QRCustomizationsContext);
    const { loadingStates, setLoading } = useQRLoadingContext();
    const isLoading = loadingStates["Settings_Colors"] ?? true;

    useEffect(() => {
        const init = async () => {
            setLoading("Settings_Colors", true);
            await (qrCustomizationsContext);
            await (colorSettingsData);
            setLoading("Settings_Colors", false);
        }
        init();
    }, []);

    const {
        selectedForegroundColor,
        setSelectedForegroundColor,
        selectedBackgroundColor,
        setSelectedBackgroundColor,
        convertedForegroundColor,
        setConvertedForegroundColor,
        convertedBackgroundColor,
        setConvertedBackgroundColor,
    } = qrCustomizationsContext;

    useEffect(() => {
        const init = async () => {
            if (!colorSettingsData.data) {
                console.log("Initializing default settings.");
            } else {
                setConvertedForegroundColor(colorSettingsData.data.fgColor);
                setConvertedBackgroundColor(colorSettingsData.data.bgColor);
            }
        }
        init();
    }, [colorSettingsData.data]);

    const colorPickerRef = useRef(null);

    const handleForegroundColorChange = useCallback(
        (newForegroundColor) => {
            setSelectedForegroundColor(newForegroundColor);
            setConvertedForegroundColor(hsbToHex(selectedForegroundColor));
        },
        [selectedForegroundColor, convertedForegroundColor],
    )

    const handleBackgroundColorChange = useCallback(
        (newBackgroundColor) => {
            setSelectedBackgroundColor(newBackgroundColor);
            setConvertedBackgroundColor(hsbToHex(selectedBackgroundColor));
        },
        [selectedBackgroundColor, convertedBackgroundColor],
    )

    function handleOnClose() {
        setVisible(false);
    }

    return (
        <Grid>
            <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }}>
                <Box paddingBlock="200">
                    <BlockStack gap="200">
                        <Text variant="bodyLg" fontWeight="bold" as="h3">
                            Colors
                        </Text>
                        <Text>
                            Configure the QR codes' color presets.
                        </Text>
                    </BlockStack>
                </Box>
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 8, sm: 4, md: 4, lg: 8, xl: 8 }}>
                <Card>
                    <InlineStack align="space-between">
                        <Popover
                            preferredPosition="below"
                            preferredAlignment="left"
                            active={visible}
                            activator={
                                <InlineStack blockAlign="end">
                                    <TextField
                                        value={convertedForegroundColor}
                                        label="Foreground color"
                                        id="foreground-color"
                                        role="combobox"
                                        onFocus={() => setVisible(true)}
                                        disabled={isLoading}
                                    />
                                    <div
                                        className={isLoading ? GlobalStyles.disabledColorPickerStyles : GlobalStyles.colorPickerStyles}
                                        style={{
                                            backgroundColor: convertedForegroundColor
                                        }} />
                                </InlineStack>
                            }
                            preferInputActivator={false}
                            fullWidth
                            onClose={handleOnClose}
                            autofocusTarget="none"
                            preventCloseOnChildOverlayClick
                        >
                            <Card ref={colorPickerRef}>
                                <ColorPicker
                                    id="foreground-color-picker"
                                    color={selectedForegroundColor}
                                    selected={selectedForegroundColor}
                                    onChange={handleForegroundColorChange}
                                />
                            </Card>
                        </Popover>
                        <Popover
                            preferredPosition="below"
                            preferredAlignment="left"
                            active={visible}
                            activator={
                                <InlineStack blockAlign="end">
                                    <TextField
                                        value={convertedBackgroundColor}
                                        label="Background color"
                                        id="background-color"
                                        role="combobox"
                                        onFocus={() => setVisible(true)}
                                        disabled={isLoading}
                                    />
                                    <div
                                        className={isLoading ? GlobalStyles.disabledColorPickerStyles : GlobalStyles.colorPickerStyles}
                                        style={{
                                            backgroundColor: convertedBackgroundColor
                                        }} />
                                </InlineStack>
                            }
                            preferInputActivator={false}
                            fullWidth
                            onClose={handleOnClose}
                            autofocusTarget="none"
                            preventCloseOnChildOverlayClick
                        >
                            <Card ref={colorPickerRef}>
                                <ColorPicker
                                    id="background-color-picker"
                                    color={selectedBackgroundColor}
                                    selected={selectedBackgroundColor}
                                    onChange={handleBackgroundColorChange}
                                />
                            </Card>
                        </Popover>
                    </InlineStack>
                </Card>
            </Grid.Cell>
        </Grid>
    )
}