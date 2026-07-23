// The backend requires the school to supply its own IDs (teacherId,
// admissionNumber, parentId) at creation time and never generates them —
// and with no update routes they can't be fixed later. To keep IDs
// consistent, create forms pre-fill the next sequential ID derived from
// the existing ones (e.g. TCH-0001 → TCH-0002). Admins can still override
// the suggestion when matching their school's own numbering.
export function suggestId(prefix, existingIds = []) {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^${escaped}(\\d+)$`, "i");

  const highest = existingIds.reduce((max, id) => {
    const match = String(id || "")
      .trim()
      .toUpperCase()
      .match(pattern);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `${prefix}${String(highest + 1).padStart(4, "0")}`;
}

export default suggestId;
