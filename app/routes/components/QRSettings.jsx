import { useCallback, useContext, useEffect, useRef, useState } from "react";
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
} from "@shopify/polaris";
import { SaveBar } from "@shopify/app-bridge-react";
import { useSubmit } from "@remix-run/react";
import QRSettingsContext from "../contexts/QRSettingsContext";
import GlobalSaveBar from "./QRSaveBar";
import Loading from "./Loading";
import { useQRLoadingContext } from "../contexts/QRLoadingContext";

export default function QRSettings({ settingsData }) {
    const [visible, setVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [{ month, year }, setDate] = useState({
        month: selectedDate.getMonth(),
        year: selectedDate.getFullYear(),
    });
    const formattedValue = selectedDate.toISOString().slice(0, 10);
    const datePickerRef = useRef(null);
    const qrSettingsContext = useContext(QRSettingsContext);
    const { loadingStates, setLoading } = useQRLoadingContext();
    const isLoading = loadingStates["QR_Settings"] ?? true;

    useEffect(() => {
        const init = async () => {
            setLoading("QR_Settings", true);
            await (qrSettingsContext);
            setLoading("QR_Settings", false);
        }
        init();
    }, []);

    const { qrName, setQRName, initialQRName, setInitialQRName } = qrSettingsContext;

    useEffect(() => {
        const init = async () => {
            if (!settingsData) {
                console.log("This is a new QR.");
                setQRName("");
            } else {
                setQRName(settingsData.data.title);
            }
        }
        init();
    }, [])

    function handleInputValueChange() {
        console.log("handleInputValueChange");
    }
    function handleOnClose({ relatedTarget }) {
        setVisible(false);
    }
    function handleMonthChange(month, year) {
        setDate({ month, year });
    }
    function handleDateSelection({ end: newSelectedDate }) {
        setSelectedDate(newSelectedDate);
        setVisible(false);
    }
    useEffect(() => {
        if (selectedDate) {
            setDate({
                month: selectedDate.getMonth(),
                year: selectedDate.getFullYear(),
            });
        }
    }, [selectedDate]);

    const handleQRNameChange = useCallback(
        (newValue) => setQRName(newValue),
        [],
    )

    return (
        <Card>
            <BlockStack gap="100">
                <Text variant="headingMd" as="h6">
                    Settings
                </Text>
                <TextField
                    label="QR code's name"
                    value={qrName}
                    onChange={handleQRNameChange}
                    placeholder="Optional"
                    maxLength={100}
                    showCharacterCount
                    disabled={isLoading}
                />
                {/* Expiry date popover */}
                {/*<Popover
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
                            label={"Expiry date"}
                            value={formattedValue}
                            onFocus={() => setVisible(true)}
                            onChange={handleInputValueChange}
                            autoComplete="off"
                        />
                    }
                >
                    <Card ref={datePickerRef}>
                        <DatePicker
                            month={month}
                            year={year}
                            selected={selectedDate}
                            onMonthChange={handleMonthChange}
                            onChange={handleDateSelection}
                        />
                    </Card>
                </Popover>*/}
            </BlockStack>
        </Card>
    )
}