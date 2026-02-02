import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isThisWeek,
  isThisYear,
  addDays,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  parseISO,
} from 'date-fns';
import { Timestamp } from 'firebase/firestore';

export const toDate = (dateOrTimestamp: Date | Timestamp | string): Date => {
  if (dateOrTimestamp instanceof Timestamp) {
    return dateOrTimestamp.toDate();
  }
  if (typeof dateOrTimestamp === 'string') {
    return parseISO(dateOrTimestamp);
  }
  return dateOrTimestamp;
};

export const formatEventDate = (date: Date | Timestamp): string => {
  const d = toDate(date);

  if (isToday(d)) {
    return `Today at ${format(d, 'h:mm a')}`;
  }

  if (isTomorrow(d)) {
    return `Tomorrow at ${format(d, 'h:mm a')}`;
  }

  if (isThisWeek(d)) {
    return format(d, "EEEE 'at' h:mm a");
  }

  if (isThisYear(d)) {
    return format(d, "MMM d 'at' h:mm a");
  }

  return format(d, "MMM d, yyyy 'at' h:mm a");
};

export const formatEventDateShort = (date: Date | Timestamp): string => {
  const d = toDate(date);

  if (isToday(d)) {
    return `Today, ${format(d, 'h:mm a')}`;
  }

  if (isTomorrow(d)) {
    return `Tomorrow, ${format(d, 'h:mm a')}`;
  }

  if (isThisYear(d)) {
    return format(d, 'MMM d, h:mm a');
  }

  return format(d, 'MMM d, yyyy');
};

export const formatEventDateRange = (
  startDate: Date | Timestamp,
  endDate: Date | Timestamp
): string => {
  const start = toDate(startDate);
  const end = toDate(endDate);

  const startStr = formatEventDate(start);
  const endTime = format(end, 'h:mm a');

  return `${startStr} - ${endTime}`;
};

export const formatTimeAgo = (date: Date | Timestamp): string => {
  const d = toDate(date);
  return formatDistanceToNow(d, { addSuffix: true });
};

export const formatMessageTime = (date: Date | Timestamp): string => {
  const d = toDate(date);

  if (isToday(d)) {
    return format(d, 'h:mm a');
  }

  if (isThisWeek(d)) {
    return format(d, 'EEE h:mm a');
  }

  if (isThisYear(d)) {
    return format(d, 'MMM d, h:mm a');
  }

  return format(d, 'MM/dd/yy');
};

export const formatChatListTime = (date: Date | Timestamp): string => {
  const d = toDate(date);

  if (isToday(d)) {
    return format(d, 'h:mm a');
  }

  if (isThisWeek(d)) {
    return format(d, 'EEE');
  }

  if (isThisYear(d)) {
    return format(d, 'MMM d');
  }

  return format(d, 'MM/dd/yy');
};

export const getDateFilters = () => {
  const today = new Date();

  return {
    today: {
      start: startOfDay(today),
      end: endOfDay(today),
    },
    tomorrow: {
      start: startOfDay(addDays(today, 1)),
      end: endOfDay(addDays(today, 1)),
    },
    thisWeek: {
      start: startOfWeek(today),
      end: endOfWeek(today),
    },
    thisWeekend: {
      start: startOfDay(addDays(startOfWeek(today), 5)),
      end: endOfDay(addDays(startOfWeek(today), 6)),
    },
  };
};

export const formatMemberSince = (date: Date | Timestamp): string => {
  const d = toDate(date);
  return format(d, 'MMMM yyyy');
};
