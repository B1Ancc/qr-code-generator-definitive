import { ActionList, BlockStack, Button, Card, Image, InlineGrid, InlineStack, Popover, Spinner, Text } from "@shopify/polaris";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { QRCodeStyling } from "qr-code-styling-node/lib/qr-code-styling.common.js";
import QRTargetContext from "../contexts/QRTargetContext";
import QRCustomizationsContext from "../contexts/QRCustomizationsContext";
import QRSettingsContext from "../contexts/QRSettingsContext";

export default function QRCard() {
    const [isLoading, setIsLoading] = useState(true);
    const [imgExt, setImgExt] = useState("JPG");
    const [visible, setVisible] = useState(false);
    const qrSettingsContext = useContext(QRSettingsContext);
    const qrTargetContext = useContext(QRTargetContext);
    const qrCustomizationsContext = useContext(QRCustomizationsContext);
    const extensions = ['JPG', 'PNG', 'SVG', 'WEBP'];
    const ref = useRef(null);

    useEffect(() => {
        const init = async () => {
            if (!qrSettingsContext || !qrTargetContext || !qrCustomizationsContext) {
                console.log("Loading...")
            } else {
                setIsLoading(false);
            }
        }
        init();
    }, [qrSettingsContext, qrTargetContext, qrCustomizationsContext])

    const { qrName } = qrSettingsContext;

    const { qrDestination } = qrTargetContext;

    const {
        convertedForegroundColor,
        convertedBackgroundColor,
        selectedPattern,
        selectedEye,
        file
    } = qrCustomizationsContext

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
        qrCode.download({ name: qrName, extension: imgExt })
    }

    useEffect(() => {
        qrCode.append(ref.current);
        console.log(qrCode);
    }, [qrName, qrDestination, convertedForegroundColor, convertedBackgroundColor, selectedPattern, selectedEye, file, imgExt]);

    useEffect(() => {
        qrCode.update({
            data: qrDestination,
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
    }, [qrName, qrDestination, convertedForegroundColor, convertedBackgroundColor, selectedPattern, selectedEye, file, imgExt]);

    const handleImageExtension = useCallback(
        (newImgExt) => {
            setImgExt(newImgExt);
            setVisible(false);
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
                            items={extensions.map((ext) => ({
                                content: ext,
                                onAction: () => handleImageExtension(ext),
                            }))}
                        />
                    </Popover>
                </InlineStack>
            </BlockStack>
        </Card >
    )
}