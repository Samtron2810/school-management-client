const defaultDateOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
};

export function formatDate(date, options = defaultDateOptions) {
  if (!date) return "";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  return new Intl.DateTimeFormat("en", options).format(parsed);
}

export function formatDateTime(date) {
  return formatDate(date, {
    ...defaultDateOptions,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default formatDate;
