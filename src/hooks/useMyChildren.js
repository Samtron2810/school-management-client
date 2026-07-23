import { useMemo } from "react";
import useApi from "./useApi";
import resultService from "../services/resultService";
import { asArray, displayName, classLabel } from "../utils/apiData";

// Parent helper: the backend exposes no parent-scoped children roster
// (GET /parent-students/parent/:id is admin-only), so children are derived
// from the parent's role-scoped results feed — each result embeds the
// populated student (with user + class info). Pages degrade to an empty note
// until a child has at least one recorded result.
export default function useMyChildren() {
  const { data, loading, error, refetch } = useApi(resultService.list);

  const results = asArray(data);

  const children = useMemo(() => {
    const map = new Map();
    results.forEach((result) => {
      const student = result.student;
      const id = student?._id || student;
      if (!id) return;
      const existing = map.get(id) || {
        id,
        name: displayName(student?.user) || "Child",
        className:
          classLabel(student?.schoolClass) !== "—"
            ? classLabel(student.schoolClass)
            : classLabel(result.classSubject?.schoolClass),
        results: 0,
      };
      existing.results += 1;
      map.set(id, existing);
    });
    return Array.from(map.values());
  }, [results]);

  return { children, results, loading, error, refetch };
}
