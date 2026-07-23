// Helpers for working with this API's payload shapes.
// List endpoints return either a plain array or { data: [], pagination } —
// these normalize both cases defensively.

export function asArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

export function getPagination(payload) {
  return payload && payload.pagination ? payload.pagination : null;
}

// Populated refs (e.g. teacher.user) may render as {_id: "..."} if not
// populated — resolve to the plain id.
export function idOf(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
}

// Full display name for user docs (firstName/lastName/otherName/fullName).
export function displayName(user) {
  if (!user || typeof user !== "object") return user || "";
  if (user.fullName || user.name) return user.fullName || user.name;
  return [user.firstName, user.otherName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
}

// Human-readable class label: "JSS 1 A", "SSS 2", etc.
export function classLabel(schoolClass) {
  if (!schoolClass) return "—";
  if (typeof schoolClass === "string") return schoolClass;
  const name = schoolClass.className || schoolClass.name || "";
  const arm = schoolClass.arm || "";
  return [name, arm].filter(Boolean).join(" ").trim() || "—";
}
