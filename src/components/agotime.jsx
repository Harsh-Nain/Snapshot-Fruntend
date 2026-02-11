export function TimeAgo(date) {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);

    const intervals = [
        { label: "year", seconds: 31536000 },
        { label: "month", seconds: 2592000 },
        { label: "day", seconds: 86400 },
        { label: "hour", seconds: 3600 },
        { label: "minute", seconds: 60 },
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
        }
    }

    return "just now";
}

export function OnTime(date) {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    const now = new Date();
    const diffSeconds = Math.floor((now - d) / 1000);

    if (diffSeconds < 10) return "Just now";

    if (diffSeconds < 60) return `${diffSeconds}s ago`;

    const minutes = Math.floor(diffSeconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return d.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    }

    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";

    return d.toLocaleDateString([], {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export function formatCount(num) {
    if (num < 1000) return num.toString();

    const units = ["K", "M", "B", "T"];
    const order = Math.floor(Math.log10(num) / 3);
    const unit = units[order - 1];
    const scaled = num / Math.pow(1000, order);

    return scaled.toFixed(1).replace(/\.0$/, "") + unit;
}
