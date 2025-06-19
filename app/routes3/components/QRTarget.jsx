import { BlockStack, Button, Card, Divider, Image, InlineGrid, InlineStack, Link, Text, TextField, Thumbnail, Tooltip, Spinner } from "@shopify/polaris"
import { createContext, useContext, useEffect, useState } from "react"
import { SelectedContext } from "../app._index"
import { useAppBridge } from "@shopify/app-bridge-react";

export default function QRTarget() {
    const [selectedProducts, setSelectedProducts] = useState([]);

    // useEffect(() => {
    //     const init = async () => {
    //         if (!selectedContext) {
    //             console.log("Loading...")
    //         } else {
    //             console.log(selectedContext);
    //             setIsLoading(false);
    //         }
    //     }
    //     init();
    // }, [selectedContext])


    // useEffect(() => {
    //     const shopify = useAppBridge();
    //     const { shop } = shopify.config;
    //     setShopURL(shop);
    // }, [])

    const handleOpenOptionPicker = async () => {
        try {
            const optionPicker = await shopify.picker({
                heading: 'Select an endpoint for the QR code',
                multiple: false,
                headers: [
                    { content: 'Endpoint' },
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
                        data: ['Link to a product page(s).'],
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
                            // { content: 'Recommended', tone: 'success' }
                        ],
                    },
                    {
                        id: 'mobile_app',
                        heading: 'Mobile App',
                        data: ['mobile_app'],
                        badges: [
                            { content: 'Internet QR Codes' },
                            // { content: 'Recommended', tone: 'success' }
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
                multiple: true,
                filter: {
                    variants: false
                },
                selectionIds: selectedProducts.map((selectedProduct) => ({
                    id: selectedProduct.id,
                }))
            });

            const pickedProducts = productPicker.map((productPick) => ({
                title: productPick.title,
                images: productPick.images[0].originalSrc, // default
                id: productPick.id,
            }))

            setSelectedProducts(() => [
                ...pickedProducts,
            ]);
        } catch (error) {
            console.error("Something went wrong: ", error);
        }
    }

    return (
        <Card>
            <BlockStack gap="200">
                <InlineStack blockAlign="center" align="space-between">
                    <Text variant="headingMd" as="h6">
                        Current target
                    </Text>
                    <Button variant="primary" onClick={() => handleOpenOptionPicker()}>
                        Select an endpoint
                    </Button>
                </InlineStack>
            </BlockStack>
        </Card>
    )
}