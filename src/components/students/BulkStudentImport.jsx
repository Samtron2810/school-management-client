import { useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  FaCheckCircle,
  FaDownload,
  FaExclamationTriangle,
  FaFileUpload,
} from "react-icons/fa";

import studentService from "../../services/studentService";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import {
  TEMPLATE_ROWS,
  downloadCsv,
  matrixToStudents,
  parseDelimited,
  readFileToMatrix,
} from "../../utils/studentImport";

const DRY_RUN_CHUNK = 150; // validate-only requests (cheap)
const CREATE_CHUNK = 25; // real creates hash passwords, so keep them small

const chunk = (list, size) => {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
};

const apiFields = (s) => {
  const { line, problems, ...rest } = s; // eslint-disable-line no-unused-vars
  return rest;
};

const errorText = (error) =>
  error?.response?.data?.message || error?.message || "Request failed";

// Bulk add students from an uploaded .xlsx/.csv or pasted spreadsheet cells.
// Steps: input -> preview (checked by the server, nothing saved yet) ->
// adding -> done (with a login-details download).
export default function BulkStudentImport({ isOpen, onClose, onDone }) {
  const [step, setStep] = useState("input");
  const [tab, setTab] = useState("upload");
  const [pasted, setPasted] = useState("");
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [inputError, setInputError] = useState("");
  const [rows, setRows] = useState([]); // [{ ...student, problems: [] }]
  const [onlyProblems, setOnlyProblems] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [outcome, setOutcome] = useState(null);
  const fileRef = useRef(null);
  const matrixRef = useRef(null);

  const reset = () => {
    setStep("input");
    setTab("upload");
    setPasted("");
    setFileName("");
    setBusy(false);
    setInputError("");
    setRows([]);
    setOnlyProblems(false);
    setOutcome(null);
    matrixRef.current = null;
  };

  const close = () => {
    if (step === "adding") return; // don't abandon a running import
    if (step === "done") onDone?.();
    reset();
    onClose();
  };

  const pickFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setInputError("");
    try {
      matrixRef.current = await readFileToMatrix(file);
      setFileName(file.name);
    } catch (err) {
      matrixRef.current = null;
      setFileName("");
      setInputError(err.message || "Could not read that file.");
    }
  };

  // Marks in-file duplicates, then asks the server to check the rest
  // (taken usernames/admission numbers, unknown classes) without saving.
  const check = async () => {
    setInputError("");
    const matrix = tab === "upload" ? matrixRef.current : parseDelimited(pasted);
    if (!matrix || matrix.length === 0) {
      setInputError(tab === "upload" ? "Choose a file first." : "Paste your list first.");
      return;
    }

    const { rows: parsed, error } = matrixToStudents(matrix);
    if (error) {
      setInputError(error);
      return;
    }
    if (parsed.length > 1000) {
      setInputError("Please import at most 1000 students at a time.");
      return;
    }

    const seen = new Map();
    parsed.forEach((s, i) => {
      for (const field of ["admissionNumber", "username", "email"]) {
        if (!s[field]) continue;
        const key = `${field}:${s[field]}`;
        if (seen.has(key))
          s.problems.push(`Duplicate ${field === "admissionNumber" ? "admission number" : field} "${s[field]}" (also row ${seen.get(key)})`);
        else seen.set(key, i + 2);
      }
    });

    setBusy(true);
    try {
      const candidates = parsed.map((s, i) => ({ s, i })).filter(({ s }) => s.problems.length === 0);
      for (const part of chunk(candidates, DRY_RUN_CHUNK)) {
        const result = await studentService.bulkCreate({
          students: part.map(({ s }) => apiFields(s)),
          dryRun: true,
        });
        result.results.forEach((r) => {
          if (!r.ok) parsed[part[r.index].i].problems.push(...r.errors);
        });
      }
      setRows(parsed);
      setStep("preview");
    } catch (err) {
      setInputError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const ready = rows.filter((r) => r.problems.length === 0);
  const withProblems = rows.length - ready.length;

  const run = async () => {
    setStep("adding");
    setProgress({ done: 0, total: ready.length });

    const created = [];
    const failed = [];

    let done = 0;
    for (const part of chunk(ready, CREATE_CHUNK)) {
      try {
        const result = await studentService.bulkCreate({
          students: part.map(apiFields),
        });
        result.results.forEach((r) => {
          const source = part[r.index];
          if (r.ok) created.push({ source, ...r.student });
          else failed.push({ source, errors: r.errors });
        });
      } catch (err) {
        part.forEach((source) =>
          failed.push({ source, errors: [`Request failed: ${errorText(err)}`] }),
        );
      }
      done += part.length;
      setProgress({ done, total: ready.length });
    }

    setOutcome({ created, failed });
    setStep("done");
  };

  const downloadLogins = () => {
    const header = ["Admission Number", "First Name", "Surname", "Class", "Username", "Password"];
    const body = outcome.created.map((c) => [
      c.admissionNumber,
      c.source.firstName,
      c.source.lastName,
      c.class || "",
      c.username,
      c.password || "(set in your file)",
    ]);
    downloadCsv("student-logins.csv", [header, ...body]);
  };

  const downloadProblems = () => {
    const body = outcome.failed.map((f) => [
      f.source.line,
      f.source.firstName,
      f.source.lastName,
      f.errors.join("; "),
    ]);
    downloadCsv("students-not-added.csv", [["Row", "First Name", "Surname", "Problem"], ...body]);
  };

  const shown = onlyProblems ? rows.filter((r) => r.problems.length > 0) : rows;

  return (
    <Modal isOpen={isOpen} onClose={close} title="Bulk Add Students" maxWidth="4xl">
      {step === "input" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="inline-flex rounded-lg bg-gray-100 p-1 text-sm">
              {[
                ["upload", "Upload file"],
                ["paste", "Paste from spreadsheet"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    tab === id ? "bg-white text-primary shadow-sm" : "text-slate-gray"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={FaDownload}
              onClick={() => downloadCsv("students-template.csv", TEMPLATE_ROWS)}
            >
              Download template
            </Button>
          </div>

          {tab === "upload" ? (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.csv,.txt"
                onChange={pickFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full rounded-lg border-2 border-dashed border-gray-300 hover:border-accent px-4 py-8 text-center transition-colors"
              >
                <FaFileUpload className="mx-auto text-2xl text-slate-gray mb-2" />
                <p className="text-sm font-medium text-primary">
                  {fileName || "Choose an Excel (.xlsx) or CSV file"}
                </p>
                <p className="text-xs text-slate-gray mt-1">
                  The first sheet is used, and the first row must be column headings.
                </p>
              </button>
            </div>
          ) : (
            <textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              rows={9}
              spellCheck={false}
              placeholder={"In Excel or Sheets, select the cells including the heading row, copy, and paste here.\n\nFirst Name\tSurname\tGender\tDate of Birth\tClass\nAda\tObi\tFemale\t05/03/2014\tJSS 1 A"}
              className="w-full rounded-lg border border-gray-200 p-3 text-sm font-mono focus:outline-none focus:border-accent"
            />
          )}

          {inputError && (
            <p className="flex items-start gap-2 text-sm text-danger">
              <FaExclamationTriangle className="mt-0.5 shrink-0" />
              {inputError}
            </p>
          )}

          <div className="rounded-lg bg-gray-50 p-3 text-xs text-slate-gray space-y-1">
            <p>
              <span className="font-semibold text-primary">Required columns:</span>{" "}
              First Name, Surname, Gender, Date of Birth (DD/MM/YYYY).
            </p>
            <p>
              <span className="font-semibold text-primary">Optional:</span> Other Name, Class
              (e.g. JSS 1 A — enrols them in the current term), Admission Number, Phone, Address,
              Username, Email, Password.
            </p>
            <p>
              Anything left blank is generated: the admission number, a username, a placeholder
              email and a random password. You'll get a download of the logins at the end.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={close}>Cancel</Button>
            <Button onClick={check} loading={busy}>Check students</Button>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap text-sm">
            <p className="text-primary">
              <span className="font-semibold">{ready.length}</span> ready
              {withProblems > 0 && (
                <>
                  {" · "}
                  <span className="font-semibold text-danger">{withProblems}</span> with problems
                  (skipped)
                </>
              )}
            </p>
            {withProblems > 0 && (
              <label className="inline-flex items-center gap-2 text-xs text-slate-gray cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyProblems}
                  onChange={(e) => setOnlyProblems(e.target.checked)}
                  className="w-4 h-4 accent-coral"
                />
                Show only problems
              </label>
            )}
          </div>

          <div className="max-h-[50vh] overflow-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 text-left text-xs text-slate-gray">
                <tr>
                  <th className="px-3 py-2">Row</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Gender</th>
                  <th className="px-3 py-2">Born</th>
                  <th className="px-3 py-2">Class</th>
                  <th className="px-3 py-2">Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shown.map((r) => (
                  <tr key={r.line} className={r.problems.length ? "bg-danger/5" : ""}>
                    <td className="px-3 py-2 text-slate-gray">{r.line}</td>
                    <td className="px-3 py-2 text-primary">
                      {[r.firstName, r.otherName, r.lastName].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="px-3 py-2">{r.gender || "—"}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{r.dateOfBirth || "—"}</td>
                    <td className="px-3 py-2">{r.class || <span className="text-slate-gray">none</span>}</td>
                    <td className="px-3 py-2">
                      {r.problems.length === 0 ? (
                        <FaCheckCircle className="text-green-600" title="Ready" />
                      ) : (
                        <ul className="text-xs text-danger space-y-0.5">
                          {r.problems.map((p) => (
                            <li key={p}>{p}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-slate-gray">
            Nothing has been saved yet. Fix problem rows in your file and check again, or add the
            ready ones now.
          </p>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setStep("input")}>Back</Button>
            <Button onClick={run} disabled={ready.length === 0}>
              Add {ready.length} student{ready.length === 1 ? "" : "s"}
            </Button>
          </div>
        </div>
      )}

      {step === "adding" && (
        <div className="py-8 space-y-3 text-center">
          <p className="text-sm font-medium text-primary">
            Adding students… {progress.done} of {progress.total}
          </p>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-coral transition-all"
              style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-slate-gray">Please keep this window open.</p>
        </div>
      )}

      {step === "done" && outcome && (
        <div className="space-y-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 flex items-start gap-2">
            <FaCheckCircle className="mt-0.5 shrink-0" />
            <span>
              <span className="font-semibold">{outcome.created.length}</span> student
              {outcome.created.length === 1 ? "" : "s"} added
              {outcome.failed.length > 0 && `, ${outcome.failed.length} not added`}.
            </span>
          </div>

          {outcome.created.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 space-y-2">
              <p>
                Download the login details now. Generated passwords are shown only this once and
                can't be recovered later.
              </p>
              <Button size="sm" icon={FaDownload} onClick={downloadLogins}>
                Download logins (CSV)
              </Button>
            </div>
          )}

          {outcome.failed.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-danger">Not added</p>
                <Button variant="outline" size="sm" icon={FaDownload} onClick={downloadProblems}>
                  Download list
                </Button>
              </div>
              <ul className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100 text-xs">
                {outcome.failed.map((f) => (
                  <li key={f.source.line} className="px-3 py-2">
                    <span className="text-slate-gray">Row {f.source.line}</span>{" "}
                    <span className="text-primary">
                      {f.source.firstName} {f.source.lastName}
                    </span>
                    : <span className="text-danger">{f.errors.join("; ")}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-gray-100">
            <Button
              onClick={() => {
                toast.dismiss();
                close();
              }}
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
