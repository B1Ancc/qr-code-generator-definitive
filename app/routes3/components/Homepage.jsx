import { useCallback, useContext, useEffect, useState } from "react";
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
} from "@shopify/polaris";
import QRSettings from "./QRSettings";
import QRCustomizations from "./QRCustomizations";
import QRTarget from "./QRTarget";
import { SelectedContext } from "../app._index";


export default function Homepage() {
    return (
        <BlockStack gap="200">
            <QRTarget />
            <QRSettings />
            <QRCustomizations />
        </BlockStack>
    );
}
