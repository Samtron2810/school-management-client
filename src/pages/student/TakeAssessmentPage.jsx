import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaPaperPlane,
} from "react-icons/fa";

import assessmentService from "../../services/assessmentService";
import studentAttemptService from "../../services/studentAttemptService";
import studentAnswerService from "../../services/studentAnswerService";
import { asArray } from "../../utils/apiData";

import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/common/StatusBadge";

function formatClock(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default function TakeAssessmentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { assessmentId, attemptId } = location.state || {};

  const [phase, setPhase] = useState("loading"); // loading | error | ready | submitting | done
  const [loadError, setLoadError] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [now, setNow] = useState(null);

  const hasTarget = Boolean(assessmentId || attemptId);
  const initRef = useRef(false); // guards StrictMode double-mount (would start the attempt twice)
  const submittedRef = useRef(false);

  // Boot: start a fresh attempt or resume an in-progress one.
  useEffect(() => {
    if (initRef.current || !hasTarget) return;
    initRef.current = true;

    (async () => {
      try {
        let activeAttempt;
        if (assessmentId) {
          activeAttempt = await studentAttemptService.start({
            assessment: assessmentId,
          });
          // Display metadata is best-effort; the attempt itself is what matters.
          assessmentService
            .get(assessmentId)
            .then((doc) => setAssessment(doc))
            .catch(() => {});
        } else {
          activeAttempt = await studentAttemptService.get(attemptId);
          if (
            activeAttempt?.assessment &&
            typeof activeAttempt.assessment === "object"
          ) {
            setAssessment(activeAttempt.assessment);
          }
        }

        if (!activeAttempt?._id)
          throw new Error("Attempt could not be created.");
        setAttempt(activeAttempt);

        // Reloaded after submitting, or the resumed attempt is already final.
        if (activeAttempt.status && activeAttempt.status !== "In Progress") {
          setResult(activeAttempt);
          setPhase("done");
          return;
        }

        const questionList = asArray(
          await studentAttemptService.questions(activeAttempt._id),
        );
        setQuestions(questionList);

        // Resuming: restore previously saved answers (one lookup per question).
        if (attemptId && questionList.length > 0) {
          const entries = await Promise.allSettled(
            questionList.map(async (item) => {
              const answer = await studentAnswerService.getOne(
                activeAttempt._id,
                item.id,
              );
              return [item.id, answer?.selectedAnswer || null];
            }),
          );
          const restored = {};
          entries.forEach((entry) => {
            if (entry.status === "fulfilled" && entry.value[1]) {
              restored[entry.value[0]] = entry.value[1];
            }
          });
          setAnswers(restored);
        }

        setNow(Date.now());
        setPhase("ready");
      } catch (err) {
        setLoadError(err);
        setPhase("error");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTarget]);

  const remainingMs =
    attempt?.expiresAt && now !== null
      ? new Date(attempt.expiresAt).getTime() - now
      : null;

  const submitNow = async (auto = false) => {
    if (submittedRef.current || !attempt) return;
    submittedRef.current = true;
    setConfirmOpen(false);
    setPhase("submitting");
    try {
      const finalized = await studentAttemptService.submit(attempt._id);
      setResult(finalized);
      if (auto) toast("Time is up: your answers were submitted.");
      else toast.success("Assessment submitted successfully.");
      setPhase("done");
    } catch {
      // Interceptor already toasted the reason; let the student retry.
      submittedRef.current = false;
      setPhase("ready");
    }
  };

  // Live countdown while the attempt is writable; auto-submit at zero.
  useEffect(() => {
    if (phase !== "ready" || !attempt?.expiresAt) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [phase, attempt]);

  useEffect(() => {
    if (phase !== "ready" || remainingMs === null || remainingMs > 0) {
      return undefined;
    }
    const id = setTimeout(() => submitNow(true), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs, phase]);

  const answeredCount = useMemo(
    () => Object.values(answers).filter(Boolean).length,
    [answers],
  );

  const chooseOption = async (questionItem, key) => {
    setAnswers((prev) => ({ ...prev, [questionItem.id]: key }));
    setSaving(true);
    try {
      await studentAnswerService.save({
        attempt: attempt._id,
        question: questionItem.id,
        selectedAnswer: key,
      });
    } catch {
      // Global interceptor surfaces the error (e.g. time expired).
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- Loading / error / submitting states ---------------- */

  if (!hasTarget || phase === "error") {
    return (
      <div>
        <PageHeader
          title="Take Assessment"
          subtitle="Start or resume an assessment"
        />
        <Card className="max-w-xl mx-auto text-center">
          <h2 className="text-lg font-semibold text-primary mb-2">
            Unable to open this assessment
          </h2>
          <p className="text-sm text-slate-gray mb-5">
            {!hasTarget
              ? "No assessment was selected. Open one from My Assessments first."
              : loadError?.response?.data?.message ||
                "The assessment may be closed, unpublished, or you've reached the maximum number of attempts."}
          </p>
          <Button onClick={() => navigate("/student/my-assessments")}>
            Back to My Assessments
          </Button>
        </Card>
      </div>
    );
  }

  if (phase === "loading") {
    return <Loader text="Preparing your assessment..." />;
  }

  if (phase === "submitting") {
    return <Loader text="Submitting your answers..." />;
  }

  /* ------------------------------ Result ------------------------------ */

  if (phase === "done") {
    const finalAssessment =
      (result?.assessment && typeof result.assessment === "object"
        ? result.assessment
        : null) ||
      assessment ||
      {};
    const showScore = finalAssessment.showScoreImmediately !== false;
    const totalMarks = finalAssessment.totalMarks;

    return (
      <div>
        <PageHeader
          title={finalAssessment.title || "Assessment"}
          subtitle="Attempt summary"
        />
        <Card className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <StatusBadge
              status={String(result?.status || "submitted")
                .toLowerCase()
                .replace(/ /g, "-")}
            />
            {showScore ? (
              <>
                <p className="text-5xl font-bold text-accent mt-4">
                  {Math.round(result?.percentage ?? 0)}%
                </p>
                <p className="text-sm text-slate-gray mt-1">
                  Score: {result?.score ?? 0}
                  {totalMarks ? ` / ${totalMarks}` : ""} · Attempt #
                  {result?.attemptNumber ?? 1}
                </p>
                <div className="mt-3">
                  <Badge variant={result?.passed ? "success" : "danger"}>
                    {result?.passed ? "Passed" : "Not passed"}
                  </Badge>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-gray mt-4">
                Your responses were submitted. Scores will be shared once they
                are released.
              </p>
            )}
          </div>

          {showScore && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg bg-accent-light">
                <p className="text-xs text-slate-gray">Answered</p>
                <p className="text-lg font-bold text-primary">
                  {result?.answeredQuestions ?? answeredCount}/
                  {result?.totalQuestions ?? questions.length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <p className="text-xs text-slate-gray">Correct</p>
                <p className="text-lg font-bold text-green-700">
                  {result?.correctAnswers ?? 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <p className="text-xs text-slate-gray">Wrong</p>
                <p className="text-lg font-bold text-danger">
                  {result?.wrongAnswers ?? 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <p className="text-xs text-slate-gray">Skipped</p>
                <p className="text-lg font-bold text-yellow-700">
                  {result?.skippedQuestions ?? 0}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
            <Button onClick={() => navigate("/student/my-assessments")}>
              Back to My Assessments
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/student/my-results")}
            >
              View My Results
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  /* ------------------------------- CBT UI ------------------------------ */

  if (questions.length === 0) {
    return (
      <div>
        <PageHeader
          title="Take Assessment"
          subtitle={assessment?.title || ""}
        />
        <Card className="max-w-xl mx-auto text-center">
          <p className="text-sm text-slate-gray mb-5">
            This assessment has no questions yet. Please check back later or
            contact your teacher.
          </p>
          <Button onClick={() => navigate("/student/my-assessments")}>
            Back to My Assessments
          </Button>
        </Card>
      </div>
    );
  }

  const questionItem = questions[current];
  const isLast = current === questions.length - 1;
  const lowTime = remainingMs !== null && remainingMs <= 5 * 60 * 1000;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {assessment?.title || "Assessment"}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            {assessment?.type && (
              <Badge variant="info">{assessment.type}</Badge>
            )}
            <span className="text-sm text-slate-gray">
              {answeredCount}/{questions.length} answered
            </span>
            <span className="text-xs text-slate-gray">
              {saving ? "Saving..." : "Answers save automatically"}
            </span>
          </div>
        </div>
        {attempt?.expiresAt && (
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
              lowTime ? "bg-red-50 text-danger" : "bg-accent-light text-accent"
            }`}
          >
            <FaClock />
            {remainingMs !== null ? formatClock(remainingMs) : "--:--"}
          </div>
        )}
      </div>

      {assessment?.instructions && (
        <Card className="mb-4 bg-accent-light/50">
          <p className="text-xs font-medium text-slate-gray uppercase mb-1">
            Instructions
          </p>
          <p className="text-sm text-primary whitespace-pre-line">
            {assessment.instructions}
          </p>
        </Card>
      )}

      {/* Question navigator */}
      <div className="flex flex-wrap gap-2 mb-4">
        {questions.map((item, index) => (
          <button
            key={item.id || index}
            onClick={() => setCurrent(index)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
              index === current
                ? "ring-2 ring-accent bg-accent text-white"
                : answers[item.id]
                  ? "bg-accent text-white hover:bg-accent/80"
                  : "bg-gray-100 text-slate-gray hover:bg-gray-200"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Current question */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-slate-gray">
            Question {current + 1} of {questions.length}
          </p>
          {questionItem.marks != null && (
            <Badge variant="primary">{questionItem.marks} mark(s)</Badge>
          )}
        </div>
        <p className="text-base font-medium text-primary mb-4">
          {questionItem.question}
        </p>
        <ul className="space-y-2">
          {(questionItem.options || []).map((option) => {
            const selected = answers[questionItem.id] === option.key;
            return (
              <li key={option.key}>
                <button
                  onClick={() => chooseOption(questionItem, option.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors ${
                    selected
                      ? "border-accent bg-accent-light"
                      : "border-gray-200 hover:border-accent/50 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-full text-sm font-bold ${
                      selected
                        ? "bg-accent text-white"
                        : "bg-gray-100 text-slate-gray"
                    }`}
                  >
                    {option.key}
                  </span>
                  <span className="text-sm text-primary">{option.text}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          icon={FaChevronLeft}
          disabled={current === 0}
          onClick={() => setCurrent((value) => Math.max(0, value - 1))}
        >
          Previous
        </Button>
        {isLast ? (
          <Button icon={FaPaperPlane} onClick={() => setConfirmOpen(true)}>
            Submit Assessment
          </Button>
        ) : (
          <Button
            icon={FaChevronRight}
            onClick={() =>
              setCurrent((value) => Math.min(questions.length - 1, value + 1))
            }
          >
            Next
          </Button>
        )}
      </div>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Submit assessment?"
      >
        <p className="text-sm text-slate-gray mb-2">
          You have answered{" "}
          <span className="font-semibold text-primary">{answeredCount}</span> of{" "}
          <span className="font-semibold text-primary">{questions.length}</span>{" "}
          questions.
        </p>
        {questions.length - answeredCount > 0 && (
          <p className="text-sm text-danger mb-4">
            {questions.length - answeredCount} question(s) will be submitted
            unanswered.
          </p>
        )}
        <div className="flex justify-end gap-3 mt-2">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
            Keep Answering
          </Button>
          <Button icon={FaPaperPlane} onClick={() => submitNow(false)}>
            Submit Now
          </Button>
        </div>
      </Modal>
    </div>
  );
}
