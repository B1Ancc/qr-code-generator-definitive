import { BlockStack, Box, Card, ColorPicker, Divider, Grid, hsbToHex, InlineStack, Page, Popover, Select, Text, TextField } from "@shopify/polaris";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { dateTimeFormat } from "../utils/dateTimeFormat";
import { useQRLoadingContext } from "../contexts/QRLoadingContext";
import SettingsDateTimeContext from "../contexts/SettingsDateTimeContext";

const timeOptions = [
    { label: 'Short (5:06)', value: 'short' },
    { label: 'Medium (5:06:07)', value: 'medium' },
    { label: 'Do not show', value: 'none' }
];

const hourOptions = [
    { label: '12-hour format (5:06 PM)', value: '12h' },
    { label: '24-hour format (17:06)', value: '24h' },
];

const dateOptions = [
    { label: 'dd-MM-yyyy', value: 'dmy' },
    { label: 'MM-dd-yyyy', value: 'mdy' },
    { label: 'yyyy-MM-dd', value: 'ymd' },
];

const dateStringOptions = [
    { label: 'Short', value: 'short' },
    { label: 'Medium', value: 'medium' },
    { label: 'Long', value: 'long' },
]

export default function SettingsDateTime({ dateTimeSettingsData, category }) {
    const settingsDateTimeContext = useContext(SettingsDateTimeContext);
    const { loadingStates, setLoading } = useQRLoadingContext();
    const isLoading = loadingStates["Settings_DateTime"] ?? true;

    useEffect(() => {
        const init = async () => {
            setLoading("Settings_DateTime", true)
            await (dateTimeSettingsData);
            await (settingsDateTimeContext);
            setLoading("Settings_DateTime", false)
        };
        init();
    }, [dateTimeSettingsData, settingsDateTimeContext]);

    const {
        selectedTimeFormat,
        setSelectedTimeFormat,
        selectedHourFormat,
        setSelectedHourFormat,
        selectedDateFormat,
        setSelectedDateFormat,
        selectedDateStringFormat,
        setSelectedDateStringFormat,
        timePreviewString,
        setTimePreviewString,
        datePreviewString,
        setDatePreviewString } = settingsDateTimeContext;

    useEffect(() => {
        const init = async () => {
            if (!dateTimeSettingsData.data) {
                console.log("Initializing default settings.");
            } else {
                setSelectedTimeFormat(dateTimeSettingsData.data.timeFormat);
                setSelectedHourFormat(dateTimeSettingsData.data.hourFormat);
                setSelectedDateFormat(dateTimeSettingsData.data.dateFormat);
                setSelectedDateStringFormat(dateTimeSettingsData.data.dateStringFormat);
                console.log(dateTimeSettingsData.data);
            }
        }
        init();
    }, [dateTimeSettingsData.data]);

    useEffect(() => {
        const now = new Date();
        const settings = {
            timeFormat: selectedTimeFormat,
            hourFormat: selectedHourFormat,
            dateFormat: selectedDateFormat,
            dateStringFormat: selectedDateStringFormat,
            isSettingsOrList: "settings",
        };
        setTimePreviewString(dateTimeFormat(now, settings, "time"));
        setDatePreviewString(dateTimeFormat(now, settings, "date"));
    }, [selectedTimeFormat, selectedHourFormat, selectedDateFormat, selectedDateStringFormat])

    const handleTimeFormatChange = useCallback(
        (newTime) => {
            setSelectedTimeFormat(newTime);
        },
        [],
    )

    const handleHourFormatChange = useCallback(
        (newHour) => {
            setSelectedHourFormat(newHour);
        },
        [],
    )

    const handleDateFormatChange = useCallback(
        (newDate) => {
            setSelectedDateFormat(newDate);
            if (newDate == "ymd") {
                setSelectedDateStringFormat("short");
            }
        },
        [],
    )

    const handleDateStringFormatChange = useCallback(
        (newDateString) => {
            setSelectedDateStringFormat(newDateString);
        },
        [],
    )

    return (
        <Grid>
            <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }}>
                <Box paddingBlock="200">
                    <BlockStack gap="200">
                        <Text variant="bodyLg" fontWeight="bold" as="h3">
                            {category == "date" ? "Date" : "Time"} format
                        </Text>
                        <Text>
                            Configure how {category == "date" ? "date" : "time"} displays in the QR codes' list.
                        </Text>
                    </BlockStack>
                </Box>
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 8, sm: 4, md: 4, lg: 8, xl: 8 }}>
                <Card>
                    <BlockStack gap="200">
                        {category == "date" ?
                            <>
                                <Select
                                    disabled={isLoading}
                                    label="Date format"
                                    options={dateOptions}
                                    onChange={handleDateFormatChange}
                                    value={selectedDateFormat}
                                />
                                <Select
                                    disabled={isLoading || selectedDateFormat === "ymd"}
                                    label="Date string"
                                    options={dateStringOptions}
                                    onChange={handleDateStringFormatChange}
                                    value={selectedDateStringFormat}
                                />
                            </>
                            :
                            <>
                                <Select
                                    disabled={isLoading}
                                    label="Time format"
                                    onChange={handleTimeFormatChange}
                                    options={timeOptions}
                                    value={selectedTimeFormat}
                                />
                                <Select
                                    disabled={isLoading || selectedTimeFormat === "none"}
                                    label="Hour format"
                                    onChange={handleHourFormatChange}
                                    options={hourOptions}
                                    value={selectedHourFormat}
                                />
                            </>
                        }
                        <Text fontWeight="bold">
                            Preview: {category == "date" ? datePreviewString : timePreviewString}
                        </Text>
                    </BlockStack>
                </Card>
            </Grid.Cell>
        </Grid>
    )
}