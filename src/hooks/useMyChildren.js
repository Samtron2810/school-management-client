import { useMemo } from "react";
import useApi from "./useApi";
import parentService from "../services/parentService";
import resultService from "../services/resultService";
import { asArray, displayName, classLabel } from "../utils/apiData";

// Parent helper: the signed-in parent's children roster comes from the
// dedicated GET /parents/my/children endpoint (linked students + current
// class). Result counts are still derived from the role-scoped results feed
// purely as display enrichment.
export default function useMyChildren() {
  const childrenApi = useApi(parentService.myChildren);
  const resultsApi = useApi(resultService.list);

  const results = asArray(resultsApi.data);

  const children = useMemo(() => {
    return asArray(childrenApi.data).map((entry) => {
      // The dedicated endpoint returns
      // { link, relationship, isPrimaryContact, student (populated user), schoolClass }.
      const student = entry.student || {};
      const linkId = entry.link?._id || entry.link || null;
      const resultCount = results.filter((result) => {
        const id = result.student?._id || result.student;
        return id && String(id) === String(student._id);
      }).length;
      return {
        id: student._id || linkId,
        linkId,
        name: displayName(student.user) || "Child",
        className:
          classLabel(entry.schoolClass) !== "—"
            ? classLabel(entry.schoolClass)
            : "—",
        schoolClass: entry.schoolClass || null,
        admissionNumber: student.admissionNumber || "—",
        relationship: entry.relationship || null,
        isPrimaryContact: Boolean(entry.isPrimaryContact),
        results: resultCount,
      };
    });
  }, [childrenApi.data, results]);

  return {
    children,
    results,
    loading: childrenApi.loading || resultsApi.loading,
    error: childrenApi.error || resultsApi.error,
    refetch: () => {
      childrenApi.refetch();
      resultsApi.refetch();
    },
  };
}
