export const C = {
    greenDeep: "#1A2E1B",
    greenForest: "#4A7C59",
    greenLeaf: "#6B9E5E",
    greenMoss: "#8B9E7A",
    earthBrown: "#8B7355",
    creamBg: "#F5F0E8",
    creamDark: "#EDE7DA",
    creamCard: "#FFFFFF",
    textMuted: "#5A6B5B",
    textLight: "#A0A89A",
    inputBg: "#FAF8F5",
    inputBorder: "#D8D0C4",
    splashBg: "#0F1F14",
    warning: "#D4920A",
    warningBg: "#FFF8E7",
    warningBorder: "#F0D080",
    danger: "#C0392B",
    dangerBg: "#FFF0EE",
    success: "#2E7D52",
    successBg: "#EDFAF3",
} as const;

export const statusColors: Record<string, string> = {
    available: C.greenForest,
    claimed: C.warning,
    picked_up: C.success,
    expired: C.danger,
    pending: C.warning,
    scheduled: C.greenLeaf,
    completed: C.success,
    cancelled: C.danger,
};

export const statusLabels: Record<string, string> = {
    available: "Available",
    claimed: "Claimed",
    picked_up: "Picked Up",
    expired: "Expired",
    pending: "Pending",
    scheduled: "Scheduled",
    completed: "Completed",
    cancelled: "Cancelled",
};
