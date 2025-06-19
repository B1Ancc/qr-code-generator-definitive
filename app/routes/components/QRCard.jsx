import { ActionList, BlockStack, Button, Card, Image, InlineGrid, InlineStack, Popover, Spinner, Text } from "@shopify/polaris";
import QRCode from "qrcode";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import SelectedContext from "../contexts/SelectedContext";
import { QRCodeStyling } from "qr-code-styling-node/lib/qr-code-styling.common.js";

export default function QRCard() {
    const [isLoading, setIsLoading] = useState(true);
    const [imgExt, setImgExt] = useState("JPG");
    const [visible, setVisible] = useState(false);
    const selectedContext = useContext(SelectedContext);
    const ref = useRef(null);

    useEffect(() => {
        const init = async () => {
            if (!selectedContext) {
                console.log("Loading...")
            } else {
                // console.log(selectedContext);
                setIsLoading(false);
            }
        }
        init();
    }, [selectedContext])

    const qrCode = new QRCodeStyling({
        width: 200,
        height: 200,
        type: "svg",
        imageOptions: {
            crossOrigin: "anonymous",
            saveAsBlob: true,
            hideBackgroundDots: true,
            margin: 1
        },
    });

    const qrCodeDownload = () => {
        qrCode.download({ name: "qr", extension: imgExt })
    }

    const {
        singleQRCodeData,
        convertedForegroundColor,
        convertedBackgroundColor,
        selectedPattern,
        selectedEye,
        file
    } = selectedContext;

    useEffect(() => {
        qrCode.append(ref.current);
    }, [singleQRCodeData, convertedForegroundColor, convertedBackgroundColor, selectedPattern, selectedEye, file]);

    useEffect(() => {
        qrCode.update({
            data: singleQRCodeData,
            image: file ? window.URL.createObjectURL(file) : null,
            dotsOptions: {
                color: convertedForegroundColor,
                type: selectedPattern
            },
            backgroundOptions: {
                color: convertedBackgroundColor
            },
            cornersSquareOptions: {
                type: selectedEye
            }
        });
    }, [singleQRCodeData, convertedForegroundColor, convertedBackgroundColor, selectedPattern, selectedEye, file]);

    const handleImageExtension = useCallback(
        (newImgExt) => {
            setImgExt(newImgExt);
            setVisible(false);
            console.log(imgExt);
        },
        [],
    );

    return (
        <Card>
            <BlockStack gap="5500">
                <BlockStack inlineAlign="center">
                    <Text variant="headingMd" as="h6">
                        Preview
                    </Text>
                    <div ref={ref} />
                </BlockStack>
                <InlineStack align="space-evenly">
                    <Button variant="primary" onClick={qrCodeDownload}>
                        Download
                    </Button>
                    <Popover
                        active={visible}
                        activator={
                            <Button onClick={() => setVisible(true)} disclosure>
                                {imgExt}
                            </Button>
                        }
                        autofocusTarget="first-node"
                        onClose={() => setVisible(false)}
                    >
                        <ActionList
                            actionRole="menuitem"
                            items={[
                                {
                                    content: 'JPG',
                                    onAction: () => handleImageExtension('JPG'),
                                },
                                {
                                    content: 'PNG',
                                    onAction: () => handleImageExtension('PNG'),
                                },
                                {
                                    content: 'SVG',
                                    onAction: () => handleImageExtension('SVG'),
                                },
                                {
                                    content: 'WEBP',
                                    onAction: () => handleImageExtension('WEBP'),
                                }
                            ]}
                        />
                    </Popover>
                </InlineStack>
            </BlockStack>
        </Card >
    )
}