import { twMerge } from "tailwind-merge";
import { type ClassValue, clsx } from "clsx";
import { eachDayOfInterval, isSameDay } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertAmountFromMiliunits(amount: number): number {
  return Number((amount / 1000).toFixed(2));
}

export function convertAmountToMiliunits(amount: number): number {
  return Math.round(amount * 1000);
}

export function formatCurrency(value: number) {
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function isValidDate(date: Date): boolean {
  return !isNaN(date.getTime());
}

export function calculatePercentangeChange(current: number, previous: number) {
  if (previous === 0) {
    return previous === current ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}

export function fillMissingDays(
  activeDays: { date: Date; income: number; expenses: number }[],
  startDate: Date,
  endDate: Date
) {
  if (activeDays.length === 0) {
    return [];
  }

  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  const transactionsByDate = allDays.map((day) => {
    const found = activeDays.find((d) => isSameDay(d.date, day));

    return found != null ? found : { date: day, income: 0, expenses: 0 };
  });

  return transactionsByDate;
}
