import { BlockStack, Button, Card, Divider, Image, InlineGrid, InlineStack, Link, Text, TextField, Thumbnail, Tooltip, Spinner } from "@shopify/polaris"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { SaveBar, useAppBridge } from "@shopify/app-bridge-react";
import TargetContext from "../contexts/TargetContext";
import GlobalSaveBar from "./GlobalSaveBar";
import Loading from "./Loading";

export default function QRTarget() {
    const shopify = useAppBridge();
    const [isLoading, setIsLoading] = useState(true);
    const [shopURL, setShopURL] = useState("");
    const [isCustomURLValid, setIsCustomURLValid] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState({
        title: null,
        images: null,
        id: null,
        url: null
    });
    // const [isProductAvailable, setIsProductAvailable] = useState(false);
    const [customURL, setCustomURL] = useState("");
    const [customText, setCustomText] = useState("");
    const [customWifiAddress, setCustomWifiAddress] = useState("");
    const [customWifiPassword, setCustomWifiPassword] = useState("");
    const targetContext = useContext(TargetContext);

    useEffect(() => {
        const init = async () => {
            if (!targetContext) {
                console.log("Loading...")
            } else {
                setIsLoading(false);
            }
        }
        init();
    }, [targetContext])

    const { selected, setSelected, qrDestination, setQRDestination } = targetContext;

    useEffect(() => {
        const { shop } = shopify.config;
        setShopURL(`https://${shop}`);
    }, [])

    useEffect(() => {
        setQRDestination();
    }, [selected])

    const handleCustomURLChange = useCallback(
        (newCustomURL) => {
            setCustomURL(newCustomURL);
            setQRDestination(newCustomURL);
        },
        [],
    )

    const checkForValidCustomURL = (string) => {
        try {
            const customURL = new URL(string);
            if (customURL.protocol === 'http:' || customURL.protocol === 'https:') {
                setIsCustomURLValid(true);
            }
        } catch (error) {
            setIsCustomURLValid(false);
        }
    }

    const handleCustomTextChange = useCallback(
        (newCustomText) => {
            setCustomText(newCustomText);
            setQRDestination(newCustomText);
        },
        [],
    )

    const handleCustomWifiAddressChange = useCallback(
        (newCustomWifiAddress) => {
            setCustomWifiAddress(newCustomWifiAddress);
        },
        [],
    )

    const handleCustomWifiPasswordChange = useCallback(
        (newCustomWifiPassword) => {
            setCustomWifiPassword(newCustomWifiPassword);
        },
        [],
    )

    useEffect(() => {
        setQRDestination(`WIFI:S:${customWifiAddress};P:${customWifiPassword};;`)
    }, [customWifiAddress, customWifiPassword])

    useEffect(() => {
        setQRDestination(selectedProduct.url);
        console.log(selectedProduct.id);
    }, [selectedProduct])

    const handleOpenOptionPicker = async () => {
        try {
            const optionPicker = await shopify.picker({
                heading: 'Select a destination for the QR code',
                multiple: false,
                headers: [
                    { content: 'Destination' },
                    { content: 'Descriptions' },
                ],
                items: [
                    {
                        id: 'homepage',
                        heading: 'Homepage',
                        data: ['Link to your Shopify store\'s homepage.'],
                        badges: [
                            { content: 'Shopify QR Codes' },
                            { content: 'Recommended', tone: 'success' }
                        ],
                    },
                    {
                        id: 'product_page',
                        heading: 'Product page',
                        data: ['Link to a product page.'],
                        badges: [
                            { content: 'Shopify QR Codes' },
                            { content: 'Recommended', tone: 'success' }
                        ],
                    },
                    {
                        id: 'cart',
                        heading: 'Add to cart',
                        data: ['Add a product(s) into the cart.'],
                        badges: [
                            { content: 'Shopify QR Codes' },
                            { content: 'Recommended', tone: 'success' }
                        ],
                    },
                    {
                        id: 'custom_url',
                        heading: 'Custom URL',
                        data: ['Link to an URL.'],
                        badges: [
                            { content: 'Internet QR Codes' },
                        ],
                    },
                    {
                        id: 'text',
                        heading: 'Text',
                        data: ['Display specified text.'],
                        badges: [
                            { content: 'Internet QR Codes' },
                        ],
                    },
                    {
                        id: 'wifi',
                        heading: 'Wi-Fi',
                        data: ['Connect to the specified Wi-Fi network.'],
                        badges: [
                            { content: 'Internet QR Codes' },
                        ],
                    },
                ],
            })

            const pickedOption = await optionPicker.selected[0];
            setSelected(pickedOption);
        }
        catch (error) {
            console.error("Something went wrong: ", error);
        }
    }

    const handleOpenProductPicker = async () => {
        try {
            const productPicker = await shopify.resourcePicker({
                type: 'product',
                multiple: false,
                filter: {
                    variants: false
                },
                // selectionIds: {
                //     id: (selectedProduct.id !== null) ? selectedProduct.id : 0
                // }
            });

            const pickedProduct = await productPicker.map((productPick) => ({
                title: productPick.title,
                images: productPick.images[0].originalSrc, // default
                id: productPick.id,
                url: `${shopURL}/products/${productPick.handle}`
            }))[0];

            setSelectedProduct(pickedProduct);

        } catch (error) {
            console.error("Something went wrong: ", error);
        }
    }

    return (
        <Card>
            <GlobalSaveBar />
            <BlockStack gap="200">
                <InlineStack blockAlign="center" align="space-between">
                    <Text variant="headingMd" as="h6">
                        Current target
                    </Text>
                    <Button variant="primary" onClick={() => handleOpenOptionPicker()} disabled={isLoading}>
                        Select a destination
                    </Button>
                </InlineStack>
                {selected === "homepage" &&
                    (
                        isLoading ? <Loading /> : (
                            <>
                                {setQRDestination(shopURL)}
                                <TextField
                                    value={shopURL}
                                    disabled
                                />
                            </>
                        )
                    )
                }
                {selected === "product_page" &&
                    (
                        isLoading ? <Loading /> : (
                            <>
                                <InlineStack blockAlign="center" align="space-between">
                                    <Tooltip content="Customer will be redirected to the selected product page." dismissOnMouseOut>
                                        <Button onClick={() => handleOpenProductPicker()}>
                                            Select a product
                                        </Button>
                                    </Tooltip>
                                </InlineStack>
                                {selectedProduct.id &&
                                    (
                                        <>
                                            <Divider />
                                            <InlineStack blockAlign="center" gap="300">
                                                <Thumbnail
                                                    source={selectedProduct.images}
                                                    size="small"
                                                    alt=""
                                                />
                                                <Link url={selectedProduct.url} target="_blank">{selectedProduct.title}</Link>
                                            </InlineStack>
                                        </>
                                    )
                                }
                            </>
                        )
                    )
                }
                {selected === "custom_url" &&
                    (
                        isLoading ? <Loading /> : (
                            <>
                                <TextField
                                    value={customURL}
                                    placeholder=""
                                    label="Destination URL"
                                    error={!isCustomURLValid ? "Invalid URL" : ""}
                                    type="url"
                                    id="custom-url-textfield"
                                    inputMode="url"
                                    onChange={handleCustomURLChange}
                                    onBlur={() => checkForValidCustomURL(customURL)}
                                />
                            </>
                        )
                    )
                }
                {selected === "text" &&
                    (
                        isLoading ? <Loading /> : (
                            <>
                                <TextField
                                    value={customText}
                                    placeholder=""
                                    label="Destination URL"
                                    multiline={4}
                                    type="text"
                                    id="custom-text-textfield"
                                    inputMode="text"
                                    onChange={handleCustomTextChange}
                                />
                            </>
                        )
                    )
                }
                {selected === "wifi" &&
                    (
                        isLoading ? <Loading /> : (
                            <>
                                <TextField
                                    value={customWifiAddress}
                                    placeholder=""
                                    label="Network name"
                                    type="text"
                                    id="custom-wifi-address-textfield"
                                    inputMode="text"
                                    onChange={handleCustomWifiAddressChange}
                                />
                                <TextField
                                    value={customWifiPassword}
                                    placeholder=""
                                    label="Password"
                                    type="password"
                                    id="custom-wifi-password-textfield"
                                    inputMode="password"
                                    onChange={handleCustomWifiPasswordChange}
                                />
                            </>
                        )
                    )
                }
            </BlockStack>
        </Card >
    )
}