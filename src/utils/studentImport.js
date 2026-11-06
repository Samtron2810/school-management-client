// Parsing + templates for bulk student import (file upload and paste).

// Normalised header -> field. Headers are lower-cased with everything but
// letters/digits removed, so "Date of Birth (DD/MM/YYYY)" -> "dateofbirthddmmyyyy".
const ALIASES = {
  firstName: ["firstname", "first", "givenname", "forename", "firstnames"],
  lastName: ["lastname", "surname", "familyname", "last"],
  otherName: ["othername", "othernames", "middlename", "middle"],
  gender: ["gender", "sex"],
  dateOfBirth: ["dateofbirth", "dob", "birthdate", "birthday"],
  class: ["class", "classname", "currentclass", "classroom", "grade"],
  admissionNumber: [
    "admissionnumber", "admissionno", "admno", "admission", "studentid",
    "regno", "registrationnumber",
  ],
  admissionDate: ["admissiondate", "dateofadmission", "dateadmitted"],
  username: ["username", "user"],
  email: ["email", "emailaddress"],
  password: ["password"],
  phoneNumber: ["phone", "phonenumber", "mobile", "telephone", "tel"],
  address: ["address", "homeaddress"],
};

export const REQUIRED_FIELDS = ["firstName", "lastName", "gender", "dateOfBirth"];

const FIELD_LABELS = {
  firstName: "First Name",
  lastName: "Surname",
  gender: "Gender",
  dateOfBirth: "Date of Birth",
};

const headerKey = (value) =>
  String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

const fieldForHeader = (header) => {
  const key = headerKey(header);
  if (!key) return null;
  for (const [field, names] of Object.entries(ALIASES)) {
    if (names.includes(key)) return field;
  }
  // "Date of Birth (DD/MM/YYYY)" and similar
  if (key.startsWith("dateofbirth")) return "dateOfBirth";
  if (key.startsWith("admissiondate")) return "admissionDate";
  return null;
};

// ── Text -> matrix ──────────────────────────────────────────────────────────

// Parses CSV / TSV text (what Excel puts on the clipboard is tab-separated)
// into rows of cells. Handles quoted cells, doubled quotes and a BOM.
export function parseDelimited(input) {
  const text = String(input ?? "").replace(/^\uFEFF/, "");
  const firstLine = text.split(/\r?\n/, 1)[0] || "";
  const counts = {
    "\t": (firstLine.match(/\t/g) || []).length,
    ",": (firstLine.match(/,/g) || []).length,
    ";": (firstLine.match(/;/g) || []).length,
  };
  const delimiter = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];

  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"' && cell === "") {
      quoted = true;
    } else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  rows.push(row);

  return rows;
}

// .csv/.txt are read as text; .xlsx is read with read-excel-file, loaded only
// when needed so it never weighs on the rest of the app.
export async function readFileToMatrix(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".xlsx")) {
    const { default: readXlsxFile } = await import("read-excel-file/browser");
    const sheets = await readXlsxFile(file);
    return sheets?.[0]?.data || [];
  }
  if (name.endsWith(".xls")) {
    throw new Error("Old .xls files aren't supported. Save it as .xlsx or .csv.");
  }
  return parseDelimited(await file.text());
}

// ── Cell cleanup ────────────────────────────────────────────────────────────

const pad = (n) => String(n).padStart(2, "0");

const isoFromParts = (y, m, d) => {
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return "";
  }
  return `${y}-${pad(m)}-${pad(d)}`;
};

// -> "YYYY-MM-DD", or "" when it can't be read. Day-first for d/m/y.
export function normalizeDate(value) {
  if (value === undefined || value === null || value === "") return "";

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? ""
      : isoFromParts(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate());
  }

  // Excel serial number (e.g. "41703" pasted from a date cell)
  if (typeof value === "number" || /^\d{4,6}$/.test(String(value).trim())) {
    const serial = Number(value);
    if (serial > 1 && serial < 80000) {
      const date = new Date(Date.UTC(1899, 11, 30) + serial * 86400000);
      return isoFromParts(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    }
  }

  const str = String(value).trim();

  let m = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return isoFromParts(+m[1], +m[2], +m[3]);

  m = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})$/);
  if (m) {
    let year = +m[3];
    if (m[3].length === 2) {
      const current = new Date().getFullYear() % 100;
      year += year <= current ? 2000 : 1900;
    }
    return isoFromParts(year, +m[2], +m[1]);
  }

  const parsed = new Date(`${str} UTC`);
  return Number.isNaN(parsed.getTime())
    ? ""
    : isoFromParts(parsed.getUTCFullYear(), parsed.getUTCMonth() + 1, parsed.getUTCDate());
}

const cellText = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

const normalizeGender = (value) => {
  const g = cellText(value).toLowerCase();
  if (["m", "male", "boy"].includes(g)) return "Male";
  if (["f", "female", "girl"].includes(g)) return "Female";
  return cellText(value); // left as typed so the preview shows what was wrong
};

// ── Matrix -> student rows ──────────────────────────────────────────────────

// Returns { rows, error }. `rows` are objects ready for the API, each with
// `line` (its row number in the sheet, header = 1) and any client-side
// `problems`. `error` is set when the header is unusable.
export function matrixToStudents(matrix) {
  const nonEmpty = matrix.filter((r) => r.some((c) => cellText(c) !== ""));
  if (nonEmpty.length === 0) return { rows: [], error: "Nothing to import." };

  const headerRow = nonEmpty[0];
  const fieldByColumn = headerRow.map(fieldForHeader);
  const present = new Set(fieldByColumn.filter(Boolean));
  const missing = REQUIRED_FIELDS.filter((f) => !present.has(f));

  if (missing.length > 0) {
    return {
      rows: [],
      error: `The first row must be column headings. Missing: ${missing
        .map((f) => FIELD_LABELS[f])
        .join(", ")}.`,
    };
  }

  const rows = nonEmpty.slice(1).map((cells) => {
    const raw = {};
    fieldByColumn.forEach((field, i) => {
      if (field && raw[field] === undefined) raw[field] = cells[i];
    });

    const line = matrix.indexOf(cells) + 1;
    const student = {
      line,
      firstName: cellText(raw.firstName),
      lastName: cellText(raw.lastName),
      otherName: cellText(raw.otherName),
      gender: normalizeGender(raw.gender),
      dateOfBirth: normalizeDate(raw.dateOfBirth),
      admissionDate: normalizeDate(raw.admissionDate),
      class: cellText(raw.class),
      admissionNumber: cellText(raw.admissionNumber).toUpperCase(),
      username: cellText(raw.username).toLowerCase(),
      email: cellText(raw.email).toLowerCase(),
      password: cellText(raw.password),
      phoneNumber: cellText(raw.phoneNumber),
      address: cellText(raw.address),
    };

    const problems = [];
    if (!student.firstName) problems.push("First name is required");
    if (!student.lastName) problems.push("Surname is required");
    if (!["Male", "Female"].includes(student.gender))
      problems.push("Gender must be Male or Female");
    if (!student.dateOfBirth) problems.push("Date of birth is missing or not a valid date");
    if (raw.admissionDate && !student.admissionDate)
      problems.push("Admission date is not a valid date");
    student.problems = problems;
    return student;
  });

  return { rows, error: rows.length === 0 ? "No students found under the headings." : "" };
}

// ── CSV output ──────────────────────────────────────────────────────────────

// Quotes cells, and defuses leading = + - @ so a name can't run as a formula.
const csvCell = (value) => {
  let s = String(value ?? "");
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export const toCsv = (rows) => rows.map((r) => r.map(csvCell).join(",")).join("\r\n");

export function downloadCsv(filename, rows) {
  // BOM so Excel opens it as UTF-8.
  const blob = new Blob(["\uFEFF" + toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const TEMPLATE_ROWS = [
  ["First Name", "Surname", "Other Name", "Gender", "Date of Birth (DD/MM/YYYY)", "Class", "Admission Number", "Phone"],
  ["Ada", "Obi", "Grace", "Female", "05/03/2014", "JSS 1 A", "", ""],
  ["Tunde", "Bello", "", "Male", "21/11/2013", "JSS 1 A", "", ""],
];
