import useApi from "./useApi";
import dashboardService from "../services/dashboardService";

// Student helper: the role-scoped dashboard payload embeds the student's
// active enrollment (with the populated schoolClass) — this is the only
// first-class way a student learns their own Student-profile id and class.
export default function useMyEnrollment() {
  const { data, loading, error, refetch } = useApi(dashboardService.getDashboard);

  const enrollment = data?.summary?.enrollment || null;
  const studentId =
    enrollment?.student?._id || enrollment?.student || null;
  const schoolClass = enrollment?.schoolClass || null;

  return {
    context: data?.context || null,
    enrollment,
    studentId,
    schoolClass,
    loading,
    error,
    refetch,
  };
}
