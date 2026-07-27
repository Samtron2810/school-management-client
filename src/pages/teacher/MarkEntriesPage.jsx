import { useCallback, useMemo } from "react";

import useMyTeaching from "../../hooks/useMyTeaching";
import MarkEntries from "../../components/MarkEntries";

export default function TeacherMarkEntriesPage() {
  const { assignments, loading } = useMyTeaching();

  // One option per distinct class the teacher teaches.
  const classOptions = useMemo(() => {
    const map = new Map();
    assignments.forEach((assignment) => {
      if (assignment.classId && !map.has(assignment.classId)) {
        map.set(assignment.classId, {
          value: assignment.classId,
          label: assignment.className,
        });
      }
    });
    return Array.from(map.values());
  }, [assignments]);

  // Only the subjects the teacher is assigned to teach within that class.
  const subjectOptionsFor = useCallback(
    (schoolClassId) => {
      const map = new Map();
      assignments
        .filter((assignment) => assignment.classId === schoolClassId)
        .forEach((assignment) => {
          if (assignment.subjectId && !map.has(assignment.subjectId)) {
            map.set(assignment.subjectId, {
              value: assignment.subjectId,
              label: assignment.subject,
            });
          }
        });
      return Array.from(map.values());
    },
    [assignments],
  );

  return (
    <MarkEntries
      classOptions={classOptions}
      subjectOptionsFor={subjectOptionsFor}
      classOptionsLoading={loading}
    />
  );
}
