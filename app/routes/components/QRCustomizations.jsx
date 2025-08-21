import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
    Text,
    Card,
    BlockStack,
    InlineStack,
    TextField,
    FormLayout,
    Tooltip,
    Popover,
    ColorPicker,
    hsbToHex,
    DropZone,
    Thumbnail,
    Button,
} from "@shopify/polaris";
import { NoteIcon } from '@shopify/polaris-icons';
import QRCustomizationsContext from "../contexts/QRCustomizationsContext";
import GlobalSaveBar from "./GlobalSaveBar";
import { useQRLoadingContext } from "../contexts/QRLoadingContext"
import Loading from "./Loading";

const colorPickerStyles = {
    width: 50,
    height: 32,
    borderRadius: 8,
    borderStyle: "solid",
    borderTopWidth: 0.4,
    borderRightWidth: 0.4,
    borderBottomWidth: 0.4,
    borderLeftWidth: 0,
    borderColor: "#8a8a8a",
};

const disabledColorPickerStyles = {
    width: 50,
    height: 32,
    borderRadius: 8,
    borderStyle: "solid",
    borderTopWidth: 0.4,
    borderRightWidth: 0.4,
    borderBottomWidth: 0.4,
    borderLeftWidth: 0,
    borderColor: "#f2f2f2",
    opacity: 0.5,
};

const patternPickerStyles = {
    cursor: "pointer",
    borderWidth: 0.4,
    borderStyle: "solid",
    borderColor: "#8a8a8a",
    borderRadius: 8,
    width: 75,
    height: 75,
    padding: 5,
}

const selectedPatternPickerStyles = {
    cursor: "pointer",
    borderWidth: 0.4,
    borderStyle: "solid",
    borderColor: "#0000ff",
    borderRadius: 8,
    backgroundColor: "#0096ff",
    width: 75,
    height: 75,
    padding: 5,
}

const disabledPatternPickerStyles = {
    borderWidth: 0.4,
    borderStyle: "solid",
    borderColor: "#f2f2f2",
    borderRadius: 8,
    width: 75,
    height: 75,
    padding: 5,
    opacity: 0.5,
    pointerEvents: "none",
}

const disabledSelectedPatternPickerStyles = {
    borderWidth: 0.4,
    borderStyle: "solid",
    borderColor: "#f2f2f2",
    borderRadius: 8,
    backgroundColor: "#0096ff",
    width: 75,
    height: 75,
    padding: 5,
    opacity: 0.5,
    pointerEvents: "none",
}

export default function QRCustomizations({ customData }) {
    const [visible, setVisible] = useState(false);
    const qrCustomizationsContext = useContext(QRCustomizationsContext);
    const { loadingStates, setLoading } = useQRLoadingContext();
    const isLoading = loadingStates["QR_Customizations"] ?? true;

    useEffect(() => {
        const init = async () => {
            setLoading("QR_Customizations", true);
            await (qrCustomizationsContext);
            setLoading("QR_Customizations", false);
        }
        init();
    }, [qrCustomizationsContext]);

    const {
        selectedForegroundColor,
        setSelectedForegroundColor,
        selectedBackgroundColor,
        setSelectedBackgroundColor,
        convertedForegroundColor,
        setConvertedForegroundColor,
        convertedBackgroundColor,
        setConvertedBackgroundColor,
        selectedPattern,
        setSelectedPattern,
        selectedEye,
        setSelectedEye,
        file,
        setFile
    } = qrCustomizationsContext;

    useEffect(() => {
        const init = async () => {
            if (!customData) {
                console.log("This is a new QR.");
            } else {
                setConvertedForegroundColor(customData.data.fgColor);
                setConvertedBackgroundColor(customData.data.bgColor);
                setSelectedPattern(customData.data.pattern);
                setSelectedEye(customData.data.eye);

                if (customData.imageData) {
                    const imageURL = customData.imageData;

                    const response = await fetch(imageURL);
                    if (!response.ok) throw new Error(imageURL);

                    const blob = await response.blob();
                    setFile(blob);
                }
            }
        }
        init();
    }, [customData]);

    useEffect(() => {
        if (customData.imageData == "200") {
            shopify.toast.show("This QR code's logo has either been corrupted or gone missing, please upload a new one.", {
                isError: true,
            });
        }
    }, [])

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

    const handlePatternChange = useCallback(
        (newPattern) => {
            setSelectedPattern(newPattern);

        },
        [],
    )

    const handleEyeChange = useCallback(
        (newEye) => {
            setSelectedEye(newEye);
        },
        [],
    )

    const handleImageDrop = useCallback(
        (_droppedFiles, acceptedFiles, _rejectedFiles) =>
            setFile(acceptedFiles[0]),
        [],
    )

    const handleImageRemove = () => {
        setFile(null);
    }

    const fileUpload = !file && <DropZone.FileUpload actionTitle="Browse an image to upload" actionHint={`or drag and drop an image here to upload. Accepts image in .jpg or .png format.`} />;
    const uploadedFile = file && (
        <BlockStack>
            <Thumbnail
                size="small"
                alt={file.name}
                source={window.URL.createObjectURL(file)}
            />
            <div>
                {file.name}{' '}
                <Text variant="bodySm" as="p">
                    {file.size} bytes
                </Text>
            </div>
        </BlockStack>
    );


    return (
        <Card>
            <BlockStack gap="100">
                <Text variant="headingMd" as="h6">
                    Customizations
                </Text>
                <FormLayout>
                    <FormLayout.Group>
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
                                        <div style={{
                                            ...(isLoading ? disabledColorPickerStyles : colorPickerStyles),
                                            backgroundColor: convertedForegroundColor,
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
                                        <div style={{
                                            ...(isLoading ? disabledColorPickerStyles : colorPickerStyles),
                                            backgroundColor: convertedBackgroundColor,
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
                    </FormLayout.Group>
                    <BlockStack gap="100">
                        <Text>
                            QR code's pattern
                        </Text>
                        <InlineStack gap="500">
                            <Tooltip content="Square" dismissOnMouseOut preferredPosition="below">
                                <div className={`body-pattern-item ${selectedPattern == "square" ? "selected" : ""}`} onClick={() => handlePatternChange("square")} style={selectedPattern == "square" ? (isLoading ? disabledSelectedPatternPickerStyles : selectedPatternPickerStyles) : (isLoading ? disabledPatternPickerStyles : patternPickerStyles)}>
                                    <img src="/assets/qr-type/square-icon.png" width="100%" height="100%" objectFit="contain"></img>
                                </div>
                            </Tooltip>
                            <Tooltip content="Rounded" dismissOnMouseOut preferredPosition="below">
                                <div className={`body-pattern-item ${selectedPattern == "rounded" ? "selected" : ""}`} onClick={() => handlePatternChange("rounded")} style={selectedPattern == "rounded" ? (isLoading ? disabledSelectedPatternPickerStyles : selectedPatternPickerStyles) : (isLoading ? disabledPatternPickerStyles : patternPickerStyles)}>
                                    <img src="/assets/qr-type/rounded-icon.png" width="100%" height="100%" objectFit="contain"></img>
                                </div>
                            </Tooltip>
                            <Tooltip content="Extra rounded" dismissOnMouseOut preferredPosition="below">
                                <div className={`body-pattern-item ${selectedPattern == "extra-rounded" ? "selected" : ""}`} onClick={() => handlePatternChange("extra-rounded")} style={selectedPattern == "extra-rounded" ? (isLoading ? disabledSelectedPatternPickerStyles : selectedPatternPickerStyles) : (isLoading ? disabledPatternPickerStyles : patternPickerStyles)}>
                                    <img src="/assets/qr-type/extra-rounded-icon.png" width="100%" height="100%" objectFit="contain"></img>
                                </div>
                            </Tooltip>
                            <Tooltip content="Dots" dismissOnMouseOut preferredPosition="below">
                                <div className={`body-pattern-item ${selectedPattern == "dots" ? "selected" : ""}`} onClick={() => handlePatternChange("dots")} style={selectedPattern == "dots" ? (isLoading ? disabledSelectedPatternPickerStyles : selectedPatternPickerStyles) : (isLoading ? disabledPatternPickerStyles : patternPickerStyles)}>
                                    <img src="/assets/qr-type/dots-icon.png" width="100%" height="100%" objectFit="contain"></img>
                                </div>
                            </Tooltip>
                            <Tooltip content="Classy rounded" dismissOnMouseOut preferredPosition="below">
                                <div className={`body-pattern-item ${selectedPattern == "classy-rounded" ? "selected" : ""}`} onClick={() => handlePatternChange("classy-rounded")} style={selectedPattern == "classy-rounded" ? (isLoading ? disabledSelectedPatternPickerStyles : selectedPatternPickerStyles) : (isLoading ? disabledPatternPickerStyles : patternPickerStyles)}>
                                    <img src="/assets/qr-type/classy-rounded-icon.png" width="100%" height="100%" objectFit="contain"></img>
                                </div>
                            </Tooltip>
                            <Tooltip content="Classy" dismissOnMouseOut preferredPosition="below">
                                <div className={`body-pattern-item ${selectedPattern == "classy" ? "selected" : ""}`} onClick={() => handlePatternChange("classy")} style={selectedPattern == "classy" ? (isLoading ? disabledSelectedPatternPickerStyles : selectedPatternPickerStyles) : (isLoading ? disabledPatternPickerStyles : patternPickerStyles)}>
                                    <img src="/assets/qr-type/classy-icon.png" width="100%" height="100%" objectFit="contain"></img>
                                </div>
                            </Tooltip>
                        </InlineStack>
                    </BlockStack>
                    <BlockStack gap="100">
                        <Text>
                            Eye frame pattern
                        </Text>
                        <InlineStack gap="500">
                            <Tooltip content="Square" dismissOnMouseOut preferredPosition="below">
                                <div className={`body-pattern-item ${selectedEye == "square" ? "selected" : ""}`} onClick={() => handleEyeChange("square")} style={selectedEye == "square" ? (isLoading ? disabledSelectedPatternPickerStyles : selectedPatternPickerStyles) : (isLoading ? disabledPatternPickerStyles : patternPickerStyles)}>
                                    <img src="/assets/qr-type/square-eye-icon.png" width="100%" height="100%" objectFit="contain"></img>
                                </div>
                            </Tooltip>
                            <Tooltip content="Rounded" dismissOnMouseOut preferredPosition="below">
                                <div className={`body-pattern-item ${selectedEye == "rounded" ? "selected" : ""}`} onClick={() => handleEyeChange("rounded")} style={selectedEye == "rounded" ? (isLoading ? disabledSelectedPatternPickerStyles : selectedPatternPickerStyles) : (isLoading ? disabledPatternPickerStyles : patternPickerStyles)}>
                                    <img src="/assets/qr-type/rounded-eye-icon.png" width="100%" height="100%" objectFit="contain"></img>
                                </div>
                            </Tooltip>
                            <Tooltip content="Extra rounded" dismissOnMouseOut preferredPosition="below">
                                <div className={`body-pattern-item ${selectedEye == "extra-rounded" ? "selected" : ""}`} onClick={() => handleEyeChange("extra-rounded")} style={selectedEye == "extra-rounded" ? (isLoading ? disabledSelectedPatternPickerStyles : selectedPatternPickerStyles) : (isLoading ? disabledPatternPickerStyles : patternPickerStyles)}>
                                    <img src="/assets/qr-type/extra-rounded-eye-icon.png" width="100%" height="100%" objectFit="contain"></img>
                                </div>
                            </Tooltip>
                        </InlineStack>
                    </BlockStack>
                    <BlockStack gap="100">
                        <Text>
                            QR code's background image
                        </Text>
                        <DropZone allowMultiple={false} onDrop={handleImageDrop} accept="image/*" type="image" disabled={isLoading}>
                            {uploadedFile}
                            {fileUpload}
                        </DropZone>
                        {file && (
                            <Button onClick={handleImageRemove} disabled={isLoading}>Remove the attached image</Button>
                        )}
                    </BlockStack>
                </FormLayout>
            </BlockStack>
        </Card>
    )
}