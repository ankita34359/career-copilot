export function formatTimestamp(input) {
  if (!input) return '';

  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

  const timeFmt = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  const time = timeFmt.format(date);

  if (date >= startOfToday && date < startOfTomorrow) return `Today • ${time}`;
  if (date >= startOfYesterday && date < startOfToday) return `Yesterday • ${time}`;

  const dayFmt = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return `${dayFmt.format(date)} • ${time}`;
}

