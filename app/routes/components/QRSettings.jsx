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
import SettingsContext from "../contexts/SettingsContext";
import GlobalSaveBar from "./GlobalSaveBar";
import Loading from "./Loading";

export default function QRSettings() {
    const [isLoading, setIsLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [{ month, year }, setDate] = useState({
        month: selectedDate.getMonth(),
        year: selectedDate.getFullYear(),
    });
    const formattedValue = selectedDate.toISOString().slice(0, 10);
    const datePickerRef = useRef(null);
    const settingsContext = useContext(SettingsContext);

    useEffect(() => {
        const init = async () => {
            if (!settingsContext) {
                console.log("Loading...")
            } else {
                setIsLoading(false);
            }
        }
        init();
    }, [settingsContext])

    const { qrName, setQRName, initialQRName, setInitialQRName } = settingsContext;

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
            <GlobalSaveBar />
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
                />
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
                </Popover>
            </BlockStack>
        </Card>
    )
}