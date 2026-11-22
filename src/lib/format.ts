const TIME_ZONE = "America/Indiana/Indianapolis";

export const formatDay = (date: Date) =>
  date.toLocaleDateString("en-US", { timeZone: TIME_ZONE, month: "long", day: "numeric", year: "numeric" });

export const formatDateTime = (date: Date) =>
  date.toLocaleString("en-US", {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
