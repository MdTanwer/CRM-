import {
  format,
  parseISO,
  formatDistanceToNow,
  isToday,
  isYesterday,
  intervalToDuration,
} from "date-fns";
import { DATE_FORMATS } from "../constants";

/**
 * Format date for display
 */
export const formatDate = (
  date: string | Date,
  formatStr: string = DATE_FORMATS.DISPLAY
): string => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch {
    return "Invalid Date";
  }
};

/**
 * Format date for input fields
 */
export const formatDateForInput = (date: string | Date): string => {
  return formatDate(date, DATE_FORMATS.INPUT);
};

/**
 * Format datetime for display
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, DATE_FORMATS.DATETIME);
};

/**
 * Format time for display
 */
export const formatTime = (date: string | Date): string => {
  return formatDate(date, DATE_FORMATS.TIME);
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch {
    return "Unknown time";
  }
};

/**
 * Format date with smart relative formatting
 */
export const formatSmartDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;

    if (isToday(dateObj)) {
      return `Today, ${formatTime(dateObj)}`;
    }

    if (isYesterday(dateObj)) {
      return `Yesterday, ${formatTime(dateObj)}`;
    }

    return formatDateTime(dateObj);
  } catch {
    return "Invalid Date";
  }
};

/**
 * Format currency
 */
export const formatCurrency = (
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

/**
 * Format number with thousands separators
 */
export const formatNumber = (
  number: number,
  locale: string = "en-US",
  options?: Intl.NumberFormatOptions
): string => {
  try {
    return new Intl.NumberFormat(locale, options).format(number);
  } catch {
    return number.toString();
  }
};

/**
 * Format percentage
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  } else if (cleaned.length === 11 && cleaned[0] === "1") {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(
      7
    )}`;
  } else if (cleaned.length > 10) {
    return `+${cleaned}`;
  }

  return phone; // Return original if can't format
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format duration in minutes to human readable format
 */
export const formatDurationMinutes = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Format duration between two dates
 */
export const formatDurationBetween = (
  start: string | Date,
  end: string | Date
): string => {
  try {
    const startDate = typeof start === "string" ? parseISO(start) : start;
    const endDate = typeof end === "string" ? parseISO(end) : end;

    const duration = intervalToDuration({ start: startDate, end: endDate });

    const parts = [];

    if (duration.hours) {
      parts.push(`${duration.hours}h`);
    }

    if (duration.minutes) {
      parts.push(`${duration.minutes}m`);
    }

    return parts.join(" ") || "0m";
  } catch {
    return "0m";
  }
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (str: string): string => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format initials from name
 */
export const getInitials = (firstName: string, lastName?: string): string => {
  const first = firstName?.charAt(0)?.toUpperCase() || "";
  const last = lastName?.charAt(0)?.toUpperCase() || "";
  return `${first}${last}`;
};

/**
 * Format full name
 */
export const formatFullName = (
  firstName: string,
  lastName?: string
): string => {
  return [firstName, lastName].filter(Boolean).join(" ");
};

/**
 * Format status label
 */
export const formatStatusLabel = (status: string): string => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
