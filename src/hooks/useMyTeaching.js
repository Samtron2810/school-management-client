import { useMemo } from "react";
import useApi from "./useApi";
import teacherAssignmentService from "../services/teacherAssignmentService";
import lessonService from "../services/lessonService";
import { asArray, classLabel, displayName } from "../utils/apiData";

// Teacher helper: the signed-in teacher's teaching context comes from the
// dedicated GET /teacher-assignments/my endpoint — the full assignment set
// is available even before any lesson is published. Lessons are still
// fetched (role-scoped GET /lessons/my) for pages that list lessons, since
// MyClassesPage/MySubjectsPage display per-class lesson counts.
export default function useMyTeaching() {
  const assignmentsApi = useApi(teacherAssignmentService.my);
  const lessonsApi = useApi(lessonService.myLessons);

  const lessons = asArray(lessonsApi.data);

  const assignments = useMemo(() => {
    return asArray(assignmentsApi.data).map((assignment) => {
      const className = classLabel(assignment.schoolClass);
      const subject = assignment.subject?.name || "N/A";
      return {
        id: assignment._id,
        classId: assignment.schoolClass?._id || assignment.schoolClass || null,
        subjectId: assignment.subject?._id || assignment.subject || null,
        subject,
        className,
        label: `${className} · ${subject}`,
        session: assignment.session?.name,
        term: assignment.term?.name,
        teacherName: displayName(assignment.teacher?.user) || null,
        isActive: assignment.isActive !== false,
        __doc: assignment,
      };
    });
  }, [assignmentsApi.data]);

  const subjects = useMemo(
    () => [
      ...new Set(
        assignments
          .map((assignment) => assignment.subject)
          .filter((s) => s !== "N/A"),
      ),
    ],
    [assignments],
  );

  const classes = useMemo(
    () => [
      ...new Set(
        assignments
          .map((assignment) => assignment.className)
          .filter((c) => c !== "N/A"),
      ),
    ],
    [assignments],
  );

  return {
    lessons,
    assignments,
    subjects,
    classes,
    loading: assignmentsApi.loading || lessonsApi.loading,
    error: assignmentsApi.error || lessonsApi.error,
    refetch: () => {
      assignmentsApi.refetch();
      lessonsApi.refetch();
    },
  };
}
