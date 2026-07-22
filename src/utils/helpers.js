export function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function capitalize(value = "") {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function toSelectOptions(items = [], labelKey = "name", valueKey = "id") {
  return items.map((item) => ({
    label: item[labelKey],
    value: item[valueKey],
  }));
}
