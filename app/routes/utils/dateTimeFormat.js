export function dateTimeFormat(currentDate, settings, category) {

    const {
        timeFormat,
        hourFormat,
        dateFormat,
        dateStringFormat,
        isSettingsOrList,
    } = settings;

    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    const seconds = currentDate.getSeconds().toString().padStart(2, '0');
    const date = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const fullMonth = new Intl.DateTimeFormat("en-US", { month: "long" }).format(currentDate);
    const weekDay = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(currentDate);
    const year = currentDate.getFullYear().toString();

    let timePreview = "";
    if (timeFormat === "short") {
        if (hourFormat === "12h") {
            timePreview = `${hours > 12 ? (hours - 12) : hours}:${minutes} ${hours > 12 ? "PM" : "AM"}`;
        } else {
            timePreview = `${hours}:${minutes}`;
        }
    } else if (timeFormat === "medium") {
        if (hourFormat === "12h") {
            timePreview = `${hours > 12 ? (hours - 12) : hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${hours > 12 ? "PM" : "AM"}`;
        } else {
            timePreview = `${hours}:${minutes}:${seconds}`;
        }
    } else {
        timePreview = "N/A";
    }

    let datePreview = "";
    if (dateFormat === "dmy") {
        if (dateStringFormat === "medium") {
            datePreview = `${date} ${fullMonth}, ${year}`;
        } else if (dateStringFormat === "long") {
            datePreview = `${weekDay}, ${date} ${fullMonth}, ${year}`;
        } else {
            datePreview = `${date}-${month}-${year}`;
        }
    } else if (dateFormat === "mdy") {
        if (dateStringFormat === "medium") {
            datePreview = `${fullMonth} ${date}, ${year}`;
        } else if (dateStringFormat === "long") {
            datePreview = `${weekDay}, ${fullMonth} ${date}, ${year}`;
        } else {
            datePreview = `${month}-${date}-${year}`;
        }
    } else {
        datePreview = `${year}-${month}-${date}`;
    }

    if (category == "date" && isSettingsOrList == "settings") {
        return `${datePreview}`
    } else if (category == "time" && isSettingsOrList == "settings") {
        return `${timePreview}`
    } else {
        return timePreview !== "N/A" ? `${datePreview} ${timePreview}` : `${datePreview}`
    };
}