import { useCallback, useState } from "react";

import classService from "../../services/classService";
import classSubjectService from "../../services/classSubjectService";
import useApi from "../../hooks/useApi";
import { asArray, classLabel } from "../../utils/apiData";

import MarkEntries from "../../components/MarkEntries";

export default function AdminMarkEntriesPage() {
  const classesApi = useApi(classService.list);
  const [subjectsByClass, setSubjectsByClass] = useState({});

  const classOptions = asArray(classesApi.data).map((schoolClass) => ({
    value: schoolClass._id,
    label: classLabel(schoolClass),
  }));

  // Lazily fetch + cache the subjects linked to a class the first time it's
  // selected, so switching back and forth doesn't refetch every time.
  const subjectOptionsFor = useCallback(
    (schoolClassId) => {
      const cached = subjectsByClass[schoolClassId];
      if (cached) return cached;

      // Trigger the fetch (fire-and-forget); returns [] until it resolves,
      // then MarkEntries re-renders once state updates.
      classSubjectService
        .list({ schoolClass: schoolClassId })
        .then((data) => {
          const options = asArray(data).map((cs) => ({
            value: cs.subject?._id || cs.subject,
            label: cs.subject?.name || "Subject",
          }));
          setSubjectsByClass((prev) => ({ ...prev, [schoolClassId]: options }));
        })
        .catch(() => {
          setSubjectsByClass((prev) => ({ ...prev, [schoolClassId]: [] }));
        });

      return [];
    },
    [subjectsByClass],
  );

  return (
    <MarkEntries
      classOptions={classOptions}
      subjectOptionsFor={subjectOptionsFor}
      classOptionsLoading={classesApi.loading}
    />
  );
}
