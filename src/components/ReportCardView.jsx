import { asArray, displayName, classLabel } from "../utils/apiData";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import GradeBadge from "./GradeBadge";
import DataTable from "./tables/DataTable";

// Renders the /report-cards/:studentId payload:
// { student, enrollment{schoolClass}, session, term,
//   summary: { subjectCount, totalScore, totalMaxMarks, averagePercentage,
//              gradeDistribution, attendance: {...} },
//   subjects: [<SubjectScore, populated classSubject.subject/schoolClass>],
//   isPublished }
export default function ReportCardView({ card }) {
  if (!card) return null;

  const student = card.student || {};
  const user = student.user || student;
  const name = displayName(user) || "—";
  const cls = classLabel(card.enrollment?.schoolClass);
  const summary = card.summary || {};
  const attendance = summary.attendance || {};
  const subjects = asArray(card.subjects);
  const gradeDistribution = summary.gradeDistribution || {};

  const columns = [
    {
      header: "Subject",
      accessor: "subject",
      render: (row) => row.classSubject?.subject?.name || "—",
    },
    {
      header: "Score",
      accessor: "score",
      render: (row) => `${row.total ?? 0} / ${row.totalMaxMarks ?? 0}`,
    },
    {
      header: "%",
      accessor: "percentage",
      render: (row) => `${row.percentage ?? 0}%`,
    },
    {
      header: "Grade",
      accessor: "grade",
      render: (row) => <GradeBadge grade={row.grade} />,
    },
    { header: "Remark", accessor: "remark" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl bg-accent-light">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-primary">{name}</h3>
            {card.isPublished ? (
              <Badge variant="success">Published</Badge>
            ) : (
              <Badge variant="warning">Draft</Badge>
            )}
          </div>
          <p className="text-sm text-slate-gray">
            {student.admissionNumber ? `Adm. No: ${student.admissionNumber} · ` : ""}
            {cls}
          </p>
        </div>
        <div className="text-sm text-slate-gray">
          <p>
            Session: <span className="font-medium text-primary">{card.session?.name || "—"}</span>
          </p>
          <p>
            Term: <span className="font-medium text-primary">{card.term?.name || "—"}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-slate-gray">Subjects</p>
          <p className="text-2xl font-bold text-primary mt-1">{summary.subjectCount ?? subjects.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-gray">Total Score</p>
          <p className="text-2xl font-bold text-primary mt-1">
            {summary.totalScore ?? 0} / {summary.totalMaxMarks ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-gray">Average</p>
          <p className="text-2xl font-bold text-accent mt-1">{summary.averagePercentage ?? 0}%</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-gray">Attendance</p>
          <p className="text-2xl font-bold text-primary mt-1">{attendance.attendancePercentage ?? 0}%</p>
        </Card>
      </div>

      <div>
        <h2 className="text-base font-semibold text-primary mb-3">Subject Results</h2>
        <DataTable columns={columns} data={subjects} pageSize={20} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-base font-semibold text-primary mb-3">Grade Distribution</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(gradeDistribution).map(([grade, count]) => (
              <span key={grade} className="text-sm text-slate-gray">
                <GradeBadge grade={grade} /> × {count}
              </span>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-base font-semibold text-primary mb-3">Attendance Summary</h3>
          <div className="flex flex-wrap gap-2 text-sm text-slate-gray">
            <Badge variant="success">Present: {attendance.present ?? 0}</Badge>
            <Badge variant="danger">Absent: {attendance.absent ?? 0}</Badge>
            <Badge variant="warning">Late: {attendance.late ?? 0}</Badge>
            <Badge variant="info">Excused: {attendance.excused ?? 0}</Badge>
            <span className="ml-1 text-slate-gray">of {attendance.total ?? 0} records</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
