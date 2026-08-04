import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FaEye, FaFileSignature } from "react-icons/fa";

import studentAttemptService from "../../services/studentAttemptService";
import studentAnswerService from "../../services/studentAnswerService";
import resultService from "../../services/resultService";
import assessmentService from "../../services/assessmentService";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import { asArray, classLabel, displayName } from "../../utils/apiData";
import { formatDateTime } from "../../utils/formatDate";

import ManagePage from "../../components/ManagePage";
import Modal from "../../components/ui/Modal";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";

const statusOptions = [
  { value: "Submitted", label: "Submitted" },
  { value: "Auto Submitted", label: "Auto Submitted" },
  { value: "In Progress", label: "In Progress" },
  { value: "Cancelled", label: "Cancelled" },
];

// Teacher attempts viewer: every student attempt on the assessments the
// teacher owns (GET /student-attempts?assessment=&status=), with a full
// per-question review (student-answers review endpoint) and one-click
// conversion of an attempt into a published result.
export default function AttemptsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const assessmentFilter = searchParams.get("assessment") || "";
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const { data, loading, error, refetch } = useApi(
    () =>
      studentAttemptService.list({
        ...(assessmentFilter ? { assessment: assessmentFilter } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      }),
    [assessmentFilter, statusFilter],
  );
  const assessmentsApi = useApi(assessmentService.list);

  const [reviewItem, setReviewItem] = useState(null);
  const [reviewRows, setReviewRows] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [recordingId, setRecordingId] = useState(null);

  const myUserId = user?._id || user?.id;

  const assessmentOptions = useMemo(
    () =>
      asArray(assessmentsApi.data)
        .filter((assessment) => {
          const teacherUserId =
            assessment.teacher?.user?._id || assessment.teacher?.user;
          return myUserId && String(teacherUserId) === String(myUserId);
        })
        .map((assessment) => ({
          value: assessment._id,
          label: `${assessment.title} · ${classLabel(
            assessment.classSubject?.schoolClass,
          )} ${assessment.classSubject?.subject?.name || ""}`.trim(),
        })),
    [assessmentsApi.data, myUserId],
  );

  const rows = asArray(data).map((attempt) => ({
    _id: attempt._id,
    student: displayName(attempt.student?.user) || "Student",
    admissionNumber: attempt.student?.admissionNumber || "N/A",
    assessment: attempt.assessment?.title || "N/A",
    type: attempt.assessment?.type || "N/A",
    status: attempt.status,
    score: `${attempt.score ?? 0}/${attempt.totalMarks ?? 0}`,
    percentage: `${Math.round(attempt.percentage ?? 0)}%`,
    passed: attempt.passed,
    submitted: attempt.submittedAt
      ? formatDateTime(attempt.submittedAt)
      : "N/A",
    __doc: attempt,
    __search:
      `${displayName(attempt.student?.user)} ${attempt.assessment?.title} ${attempt.status}`.toLowerCase(),
  }));

  const filtered = rows.filter((row) =>
    row.__search.includes(search.toLowerCase()),
  );

  const openReview = async (row) => {
    setReviewItem(row.__doc);
    setReviewRows(null);
    setReviewLoading(true);
    try {
      const payload = await studentAnswerService.review(row._id);
      setReviewRows(asArray(payload));
    } catch {
      setReviewRows([]);
    } finally {
      setReviewLoading(false);
    }
  };

  const recordResult = async (row) => {
    setRecordingId(row._id);
    try {
      await resultService.fromAttempt(row._id);
      toast.success(`Result published for ${row.student}`);
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setRecordingId(null);
    }
  };

  const columns = [
    { header: "Student", accessor: "student" },
    { header: "Admission No.", accessor: "admissionNumber" },
    { header: "Assessment", accessor: "assessment" },
    { header: "Type", accessor: "type" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    { header: "Score", accessor: "score" },
    { header: "%", accessor: "percentage" },
    { header: "Submitted", accessor: "submitted" },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={FaEye}
            title="Review attempt"
            onClick={() => openReview(row)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={FaFileSignature}
            title="Record result"
            loading={recordingId === row._id}
            onClick={() => recordResult(row)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <ManagePage
        title="Assessment Attempts"
        subtitle="Review student attempts, answers, and publish results"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search attempts..."
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyTitle="No attempts found"
        emptyDescription="Attempts appear here once students take your assessments."
        toolbar={
          <div className="flex flex-col sm:flex-row gap-3 sm:w-auto w-full">
            <div className="sm:w-72">
              <Select
                name="assessment"
                value={assessmentFilter}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchParams(value ? { assessment: value } : {});
                }}
                options={assessmentOptions}
                placeholder="All my assessments"
              />
            </div>
            <div className="sm:w-48">
              <Select
                name="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={statusOptions}
                placeholder="All statuses"
              />
            </div>
          </div>
        }
      />

      <Modal
        isOpen={Boolean(reviewItem)}
        onClose={() => setReviewItem(null)}
        title={`Attempt Review: ${displayName(reviewItem?.student?.user) || "Student"}`}
        maxWidth="xl"
      >
        {reviewLoading ? (
          <Loader text="Loading answers..." />
        ) : reviewRows === null ? null : reviewRows.length === 0 ? (
          <p className="text-sm text-slate-gray">
            No question data available for this attempt.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info">
                Score: {reviewItem?.score ?? 0}/{reviewItem?.totalMarks ?? 0}
              </Badge>
              <Badge variant={reviewItem?.passed ? "success" : "danger"}>
                {reviewItem?.passed ? "Passed" : "Not passed"}
              </Badge>
              <Badge variant="info">{reviewItem?.assessment?.title}</Badge>
            </div>
            {reviewRows.map((item, index) => (
              <div
                key={item._id || index}
                className="rounded-lg border border-gray-100 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-primary">
                    {index + 1}.{" "}
                    {item.question?.question || "Question unavailable"}
                  </p>
                  <Badge
                    variant={
                      item.selectedAnswer == null
                        ? "secondary"
                        : item.isCorrect
                          ? "success"
                          : "danger"
                    }
                  >
                    {item.selectedAnswer == null
                      ? "Skipped"
                      : item.isCorrect
                        ? "Correct"
                        : "Wrong"}
                  </Badge>
                </div>
                {Array.isArray(item.question?.options) &&
                  item.question.options.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {item.question.options.map((option, optionIndex) => {
                        const isChosen = option === item.selectedAnswer;
                        const isCorrectOption =
                          item.question.correctAnswer != null &&
                          option === item.question.correctAnswer;
                        return (
                          <li
                            key={optionIndex}
                            className={`text-xs px-2.5 py-1.5 rounded ${
                              isCorrectOption
                                ? "bg-green-50 text-green-700 font-medium"
                                : isChosen
                                  ? "bg-red-50 text-danger"
                                  : "text-slate-gray"
                            }`}
                          >
                            {option}
                            {isChosen ? " (student's answer)" : ""}
                            {isCorrectOption ? " (correct)" : ""}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                <p className="mt-2 text-xs text-slate-gray">
                  Marks: {item.marksAwarded ?? 0}/{item.marks ?? 0}
                  {item.selectedAnswer != null && (
                    <> · Student's answer: {item.selectedAnswer}</>
                  )}
                </p>
                {item.question?.explanation && (
                  <p className="mt-1 text-xs text-slate-gray italic">
                    {item.question.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
