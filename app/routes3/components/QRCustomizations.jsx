import { createContext, useCallback, useEffect, useRef, useState } from "react";
import {
    Page,
    Layout,
    Text,
    Card,
    Button,
    BlockStack,
    Box,
    List,
    Link,
    InlineStack,
    Grid,
    TextField,
    FormLayout,
    Tooltip,
    Select,
    DatePicker,
    Icon,
    Popover,
    ColorPicker,
    hsbToHex,
    InlineGrid,
    hsbToRgb,
} from "@shopify/polaris";

export default function QRCustomizations() {
    const [visible, setVisible] = useState(false);
    const [selectedColor, setSelectedColor] = useState(
        {
            hue: 120,
            brightness: 1,
            saturation: 1,
        });
    const [rgbValue, setRGBValue] = useState('#000000')
    const formattedHexValue = hsbToHex(selectedColor);
    const formattedRGBValue = hsbToRgb(selectedColor);
    const colorPickerRef = useRef(null);

    function handleInputValueChange() {
        console.log("handleInputValueChange");
    }

    function handleOnClose({ relatedTarget }) {
        setVisible(false);
    }

    function handleColorChange(selectedColor) {
        setSelectedColor(selectedColor);
    }

    useEffect(() => {
        if (selectedColor) {
            setSelectedColor(selectedColor);
        }
    }, [selectedColor]);

    return (
        <Card>
            <BlockStack gap="100">
                <Text variant="headingMd" as="h6">
                    Customizations
                </Text>
                <FormLayout>
                    <FormLayout.Group>
                        <Popover
                            active={visible}
                            autofocusTarget="none"
                            preferredAlignment="left"
                            fullWidth
                            preferInputActivator={false}
                            preferredPosition="below"
                            preventCloseOnChildOverlayClick
                            onClose={handleOnClose}
                            activator={
                                <TextField
                                    role="combobox"
                                    label={"Foreground color"}
                                    value={formattedHexValue}
                                    onFocus={() => setVisible(true)}
                                    onChange={handleInputValueChange}
                                    autoComplete="off"
                                />
                            }
                        >
                            <Card ref={colorPickerRef}>
                                <Grid>
                                    <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }}>
                                        <ColorPicker
                                            color={selectedColor}
                                            selected={selectedColor}
                                            onChange={handleColorChange}
                                        />
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 8, sm: 4, md: 4, lg: 8, xl: 8 }}>
                                        <TextField
                                            value={formattedHexValue}
                                            label="Hex"
                                        />
                                        <TextField
                                            value={formattedRGBValue.red}
                                            label="R"
                                        />
                                        <TextField
                                            value={formattedRGBValue.green}
                                            label="G"
                                        />
                                        <TextField
                                            value={formattedRGBValue.blue}
                                            label="B"
                                        />
                                    </Grid.Cell>
                                </Grid>
                            </Card>
                        </Popover>
                        {/* <Popover
                            active={visible}
                            autofocusTarget="none"
                            preferredAlignment="left"
                            fullWidth
                            preferInputActivator={false}
                            preferredPosition="below"
                            preventCloseOnChildOverlayClick
                            onClose={handleOnClose}
                            activator={
                                <TextField
                                    role="combobox"
                                    label={"Background color"}
                                    value={formattedHexValue}
                                    onFocus={() => setVisible(true)}
                                    onChange={handleInputValueChange}
                                    autoComplete="off"
                                />
                            }
                        >
                            <Card ref={colorPickerRef}>
                                <ColorPicker
                                    color={selectedColor}
                                    selected={selectedColor}
                                    onChange={handleColorChange}
                                />
                            </Card>
                        </Popover> */}
                    </FormLayout.Group>
                </FormLayout>
            </BlockStack>
        </Card>
    )
}