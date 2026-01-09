import { BlockStack, Button, Card, Divider, Image, InlineGrid, InlineStack, Link, Text, TextField, Thumbnail, Tooltip, Spinner, ResourceItem, Avatar, ResourceList } from "@shopify/polaris"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { SaveBar, useAppBridge } from "@shopify/app-bridge-react";
import QRTargetContext from "../contexts/QRTargetContext";
import GlobalSaveBar from "./QRSaveBar";
import Loading from "./Loading";
import { useQRLoadingContext } from "../contexts/QRLoadingContext"

export default function QRTarget({ targetData }) {
    const shopify = useAppBridge();
    const [shopURL, setShopURL] = useState("");
    const [isCustomURLValid, setIsCustomURLValid] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState({
        title: null,
        images: null,
        id: null,
        url: null
    });
    const [selectedCart, setSelectedCart] = useState({
        title: null,
        images: null,
        id: null,
        variantId: null,
        variantName: null,
        url: null,
        stock: null,
    });
    const [customURL, setCustomURL] = useState("");
    const [customText, setCustomText] = useState("");
    const [customWifiAddress, setCustomWifiAddress] = useState("");
    const [customWifiPassword, setCustomWifiPassword] = useState("");
    const qrTargetContext = useContext(QRTargetContext);
    const { loadingStates, setLoading } = useQRLoadingContext();
    const isLoading = loadingStates["QR_Target"] ?? true;

    useEffect(() => {
        const init = async () => {
            setLoading("QR_Target", true);
            await (qrTargetContext);
            setLoading("QR_Target", false);
        }
        init();
    }, []);

    const {
        selected,
        setSelected,
        qrDestination,
        setQRDestination,
        qrProductId,
        setQRProductId,
        qrVariantId,
        setQRVariantId } = qrTargetContext;

    useEffect(() => {
        const { shop } = shopify.config;
        setShopURL(`https://${shop}`);
    }, []);

    useEffect(() => {
        const init = async () => {
            if (!targetData) {
                console.log("This is a new QR.");
            } else {
                if (targetData.data.endpoint === "Product page") {
                    setSelected("Product page");
                    console.log(targetData.data);
                    setSelectedProduct({
                        title: targetData.data.productTitle,
                        images: targetData.data.productImage,
                        id: targetData.data.productId,
                        url: targetData.data.destination,
                    })
                }
                else if (targetData.data.endpoint === "Add to cart") {
                    setSelected("Add to cart");
                    setSelectedCart({
                        title: targetData.data.productTitle,
                        images: targetData.data.productVariantImage,
                        id: targetData.data.productId,
                        variantId: targetData.data.variantId,
                        variantName: targetData.data.productVariantTitle,
                        url: targetData.data.destination,
                        stock: targetData.data.productVariantQuantity,
                    })
                }
            }
        }
        init();
    }, []);

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
        setQRProductId(selectedProduct.id);
    }, [selectedProduct])

    useEffect(() => {
        setQRDestination(selectedCart.url);
        setQRProductId(selectedCart.id);
        setQRVariantId(selectedCart.variantId);
    }, [selectedCart])

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
                        id: 'Homepage',
                        heading: 'Homepage',
                        data: ['Link to your Shopify store\'s homepage.'],
                        badges: [
                            { content: 'Shopify QR Codes' },
                            { content: 'Recommended', tone: 'success' }
                        ],
                    },
                    {
                        id: 'Product page',
                        heading: 'Product page',
                        data: ['Link to a product page.'],
                        badges: [
                            { content: 'Shopify QR Codes' },
                            { content: 'Recommended', tone: 'success' }
                        ],
                    },
                    {
                        id: 'Add to cart',
                        heading: 'Add to cart',
                        data: ['Add a product(s) into the cart.'],
                        badges: [
                            { content: 'Shopify QR Codes' },
                            { content: 'Recommended', tone: 'success' }
                        ],
                    },
                    {
                        id: 'Custom URL',
                        heading: 'Custom URL',
                        data: ['Link to an URL.'],
                        badges: [
                            { content: 'Internet QR Codes' },
                        ],
                    },
                    {
                        id: 'Text',
                        heading: 'Text',
                        data: ['Display specified text.'],
                        badges: [
                            { content: 'Internet QR Codes' },
                        ],
                    },
                    {
                        id: 'Wi-Fi',
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
            });

            const pickedProduct = await productPicker.map(({ title, images, id, handle }) => ({
                title: title,
                images: images[0].originalSrc, // default
                id: id,
                url: `${shopURL}/products/${handle}`
            }))[0];
            setSelectedProduct(pickedProduct);
        } catch (error) {
            console.error("Something went wrong: ", error);
        }
    }

    const handleOpenCartPicker = async () => {
        try {
            const cartPicker = await shopify.resourcePicker({
                type: 'product',
                multiple: false,
                filter: {
                    variants: true,
                    query: "inventory_total:>=1"
                },
            });

            const pickedCart = await cartPicker.map(({ title, images, id, variants, handle }) => {
                const productVariant = variants[0].id.split("gid://shopify/ProductVariant/");
                return ({
                    title: title,
                    images: images[0].originalSrc, // default
                    id: id,
                    variantId: variants[0].id,
                    variantName: variants[0].title,
                    url: `${shopURL}/cart/${productVariant[1]}:1`,
                    stock: variants[0].inventoryQuantity,
                });
            })[0];
            setSelectedCart(pickedCart);
        } catch (error) {
            console.error("Something went wrong: ", error);
        }
    }

    return (
        <Card>
            <BlockStack gap="200">
                <InlineStack blockAlign="center" align="space-between">
                    <Text variant="headingMd" as="h6">
                        Current target - {selected}
                    </Text>
                    <Button variant="primary" onClick={() => handleOpenOptionPicker()} disabled={isLoading}>
                        Select an endpoint
                    </Button>
                </InlineStack>
                {selected === "Homepage" &&
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
                {selected === "Product page" &&
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
                                            <ResourceList
                                                resourceName={{ singular: 'product', plural: 'products' }}
                                                items={[
                                                    {
                                                        id: selectedProduct.id,
                                                        url: selectedProduct.url,
                                                        imgSrc: selectedProduct.images,
                                                        name: selectedProduct.title
                                                    },
                                                ]}
                                                renderItem={(item) => {
                                                    const { id, url, imgSrc, name } = item;

                                                    return (
                                                        <ResourceItem
                                                            id={id}
                                                            media={
                                                                <Thumbnail
                                                                    source={imgSrc}
                                                                    size="small"
                                                                    alt={name}
                                                                />
                                                            }
                                                            accessibilityLabel={`View details for ${name}`}
                                                            name={name}
                                                        >
                                                            <Text variant="bodyMd" fontWeight="bold" as="h3">
                                                                {name}
                                                            </Text>
                                                        </ResourceItem>
                                                    );
                                                }}
                                            />
                                            {/* <InlineStack blockAlign="center" gap="300">
                                                <Thumbnail
                                                    source={selectedProduct.images}
                                                    size="small"
                                                    alt=""
                                                />
                                                <Link url={selectedProduct.url} target="_blank">{selectedProduct.title}</Link>
                                            </InlineStack> */}
                                        </>
                                    )
                                }
                            </>
                        )
                    )
                }
                {selected === "Add to cart" &&
                    (
                        isLoading ? <Loading /> : (
                            <>
                                <InlineStack blockAlign="center" align="space-between">
                                    <Tooltip content="Customer will be redirected to the selected product page." dismissOnMouseOut>
                                        <Button onClick={() => handleOpenCartPicker()}>
                                            Select a product
                                        </Button>
                                    </Tooltip>
                                </InlineStack>
                                {selectedCart.id &&
                                    (
                                        <>
                                            <Divider />
                                            <ResourceList
                                                resourceName={{ singular: 'cart', plural: 'carts' }}
                                                items={[
                                                    {
                                                        name: selectedCart.title,
                                                        imgSrc: selectedCart.images,
                                                        id: selectedCart.id,
                                                        variantId: selectedCart.variantId,
                                                        variantName: selectedCart.variantName,
                                                        url: selectedCart.url,
                                                        stock: selectedCart.stock,
                                                    },
                                                ]}
                                                renderItem={(item) => {
                                                    const { name, imgSrc, id, variantId, variantName, url, stock } = item;

                                                    return (
                                                        <ResourceItem
                                                            id={id}
                                                            media={
                                                                <Thumbnail
                                                                    source={imgSrc}
                                                                    size="small"
                                                                    alt={name}
                                                                />
                                                            }
                                                            accessibilityLabel={`View details for ${name}`}
                                                            name={name}
                                                        >
                                                            <Text variant="bodyMd" fontWeight="bold" as="h3">
                                                                {name}
                                                            </Text>
                                                            <Text variant="bodyMd" fontWeight="subdued" as="h4">
                                                                {variantName}
                                                            </Text>
                                                            {stock <= 0 && <Text variant="bodyMd" tone="critical" as="h4">This product is currently out of stock.</Text>}
                                                        </ResourceItem>
                                                    );
                                                }}
                                            />
                                            {/* <InlineStack blockAlign="center" gap="300">
                                                <Thumbnail
                                                    source={selectedCart.images}
                                                    size="small"
                                                    alt=""
                                                />
                                                <BlockStack>
                                                    <Link url={selectedCart.url} target="_blank">{selectedCart.title}</Link>
                                                    {selectedCart.variantName !== "Default Title" && <Text>{selectedCart.variantName}</Text>}
                                                    {selectedCart.stock <= 0 && <Text tone="critical">This product is currently out of stock.</Text>}
                                                </BlockStack>
                                            </InlineStack> */}
                                        </>
                                    )
                                }
                            </>
                        )
                    )
                }
                {selected === "Custom URL" &&
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
                {selected === "Text" &&
                    (
                        isLoading ? <Loading /> : (
                            <>
                                <TextField
                                    value={customText}
                                    placeholder="Enter text here..."
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
                {selected === "Wi-Fi" &&
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