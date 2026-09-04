export type DatedItem = {
  date: string;
  isRecurring: boolean;
};

export function getNextOccurrence({ date, isRecurring }: DatedItem) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const source = new Date(`${date}T00:00:00`);

  if (!isRecurring) return source;

  const occurrence = new Date(
    today.getFullYear(),
    source.getMonth(),
    source.getDate()
  );

  if (occurrence < today) occurrence.setFullYear(occurrence.getFullYear() + 1);
  return occurrence;
}

export function daysUntil(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / 86_400_000);
}

export function formatDate(date: string, includeYear = false) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    ...(includeYear ? { year: "numeric" } : {}),
  });
}
