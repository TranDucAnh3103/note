import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const formatDate = (date: string | Date): string => {
  return dayjs(date).format("MMM D, YYYY");
};

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format("MMM D, YYYY h:mm A");
};

export const formatRelativeTime = (date: string | Date): string => {
  return dayjs(date).fromNow();
};

export const isToday = (date: string | Date): boolean => {
  return dayjs(date).isSame(dayjs(), "day");
};

export const isYesterday = (date: string | Date): boolean => {
  return dayjs(date).isSame(dayjs().subtract(1, "day"), "day");
};

export const formatSmartDate = (date: string | Date): string => {
  if (isToday(date)) {
    return `Today at ${dayjs(date).format("h:mm A")}`;
  }
  if (isYesterday(date)) {
    return `Yesterday at ${dayjs(date).format("h:mm A")}`;
  }
  return formatDate(date);
};
