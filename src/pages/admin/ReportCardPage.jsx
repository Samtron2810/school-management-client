import { useState } from "react";
import toast from "react-hot-toast";
import { FaDownload } from "react-icons/fa";

import reportCardService from "../../services/reportCardService";
import studentService from "../../services/studentService";
import classService from "../../services/classService";
import useApi from "../../hooks/useApi";
import { asArray, classLabel, displayName } from "../../utils/apiData";
import downloadBlobResponse from "../../utils/downloadBlob";

import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import ReportCardView from "../../components/ReportCardView";
import ClassReportCards from "../../components/ClassReportCards";

export default function ReportCardPage() {
  const studentsApi = useApi(studentService.list);
  const classesApi = useApi(classService.list);

  const [activeTab, setActiveTab] = useState("class");
  const [studentId, setStudentId] = useState("");
  const [card, setCard] = useState(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const studentOptions = asArray(studentsApi.data).map((student) => ({
    value: student._id,
    label: `${displayName(student.user || student)}${student.admissionNumber ? ` (${student.admissionNumber})` : ""}`,
  }));
  const classOptions = asArray(classesApi.data).map((schoolClass) => ({
    value: schoolClass._id,
    label: classLabel(schoolClass),
  }));

  const loadCard = async (targetId) => {
    if (!targetId) return;
    setCardLoading(true);
    try {
      const payload = await reportCardService.get(targetId);
      setCard(payload);
    } catch {
      setCard(null);
      toast.error("Could not load the report card");
    } finally {
      setCardLoading(false);
    }
  };

  const downloadCard = async () => {
    if (!studentId) return;
    setDownloading(true);
    try {
      const response = await reportCardService.download(studentId);
      downloadBlobResponse(
        response,
        `${displayName(card?.student?.user) || "report-card"}.pdf`,
      );
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  if (studentsApi.loading || classesApi.loading) {
    return <Loader text="Loading..." />;
  }
  if (studentsApi.error) return <ErrorState onRetry={studentsApi.refetch} />;

  return (
    <div>
      <PageHeader
        title="Report Cards"
        subtitle="Review, publish, and download student report cards"
      />

      {/* Tab toggler buttons */}
      <div className="flex gap-10 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("class")}
          className={`pb-2.5 text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === "class"
              ? "border-royal-blue text-royal-blue"
              : "border-transparent text-slate-gray hover:text-primary"
          }`}
        >
          Class Report Cards
        </button>
        <button
          onClick={() => setActiveTab("student")}
          className={`pb-2.5 text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === "student"
              ? "border-royal-blue text-royal-blue"
              : "border-transparent text-slate-gray hover:text-primary"
          }`}
        >
          Single Student Report Card
        </button>
      </div>

      {activeTab === "class" ? (
        <ClassReportCards classOptions={classOptions} />
      ) : (
        <>
          <Card className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="flex-1">
                <Select
                  label="Student"
                  name="student"
                  value={studentId}
                  onChange={(e) => {
                    setStudentId(e.target.value);
                    setCard(null);
                  }}
                  options={studentOptions}
                  placeholder="Select a student"
                />
              </div>
              <Button
                onClick={() => loadCard(studentId)}
                disabled={!studentId}
                loading={cardLoading}
              >
                View Report Card
              </Button>
              {card && (
                <Button
                  variant="outline"
                  icon={FaDownload}
                  onClick={downloadCard}
                  loading={downloading}
                >
                  Download
                </Button>
              )}
            </div>
          </Card>

          {cardLoading ? (
            <Loader text="Loading report card..." />
          ) : card ? (
            <Card className="mb-6">
              <ReportCardView card={card} />
            </Card>
          ) : (
            <EmptyState
              title="No report card selected"
              description="Pick a student above to view their report card."
            />
          )}
        </>
      )}
    </div>
  );
}
