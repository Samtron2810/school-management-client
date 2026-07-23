import { useMemo } from "react";
import useApi from "./useApi";
import lessonService from "../services/lessonService";
import { asArray, classLabel } from "../utils/apiData";

// Derives the signed-in teacher's teaching context from their lessons
// (teacher-scoped GET /lessons/my returns teacherAssignment populated with
// subject + schoolClass). This is the only teacher-accessible source of
// teacherAssignment ids — the raw /teacher-assignments list is admin-only.
export default function useMyTeaching() {
  const { data, loading, error, refetch } = useApi(lessonService.myLessons);

  const lessons = asArray(data);

  const assignments = useMemo(() => {
    const map = new Map();
    lessons.forEach((lesson) => {
      const assignment = lesson.teacherAssignment;
      const id = assignment?._id || assignment;
      if (!id) return;
      map.set(id, {
        id,
        subject: assignment.subject?.name || "—",
        className: classLabel(assignment.schoolClass),
        label: `${classLabel(assignment.schoolClass)} · ${assignment.subject?.name || "—"}`,
        session: assignment.session?.name || lesson.session?.name,
        term: assignment.term?.name || lesson.term?.name,
      });
    });
    return Array.from(map.values());
  }, [lessons]);

  const subjects = useMemo(
    () => [...new Set(assignments.map((assignment) => assignment.subject).filter((s) => s !== "—"))],
    [assignments],
  );

  const classes = useMemo(
    () => [...new Set(assignments.map((assignment) => assignment.className).filter((c) => c !== "—"))],
    [assignments],
  );

  return { lessons, assignments, subjects, classes, loading, error, refetch };
}
