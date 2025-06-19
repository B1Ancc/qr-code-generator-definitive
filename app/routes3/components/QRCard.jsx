import { BlockStack, Button, Card, Image, InlineStack, Spinner, Text } from "@shopify/polaris";
import QRCode from "qrcode";
import { useContext, useEffect, useState } from "react";
import { SelectedContext } from "../app._index";

export default function QRCard() {

    return (
        <Card>
            <BlockStack gap="5500">
                <BlockStack inlineAlign="center">
                    <Text variant="headingMd" as="h6">
                        Preview
                    </Text>
                    {/* {qrCodeData && <Image id="singleQRCode" />} */}
                    <Button url="https://facebook.com" download="Link.pdf">
                        Download
                    </Button>
                </BlockStack>
            </BlockStack>
        </Card>
    )
}