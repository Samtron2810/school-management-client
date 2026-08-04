import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AdminLayout from "./layouts/AdminLayout";
import TeacherLayout from "./layouts/TeacherLayout";
import StudentLayout from "./layouts/StudentLayout";
import ParentLayout from "./layouts/ParentLayout";
import AuthLayout from "./layouts/AuthLayout";
import ErrorBoundary from "./components/common/ErrorBoundary";
import Loader from "./components/common/Loader";
import { AuthProvider } from "./context/AuthContext";

// Admin Pages — lazy-loaded so the admin bundle only downloads for admins,
// not for every role. Same pattern for teacher/student/parent below.
const DashboardPage = lazy(() => import("./pages/admin/DashboardPage"));
const StudentManagementPage = lazy(
  () => import("./pages/admin/StudentManagementPage"),
);
const TeacherManagementPage = lazy(
  () => import("./pages/admin/TeacherManagementPage"),
);
const ClassManagementPage = lazy(
  () => import("./pages/admin/ClassManagementPage"),
);
const SubjectManagementPage = lazy(
  () => import("./pages/admin/SubjectManagementPage"),
);
const AttendanceOverviewPage = lazy(
  () => import("./pages/admin/AttendanceOverviewPage"),
);
const AssessmentManagementPage = lazy(
  () => import("./pages/admin/AssessmentManagementPage"),
);
const AnnouncementManagementPage = lazy(
  () => import("./pages/admin/AnnouncementManagementPage"),
);
const SessionManagementPage = lazy(
  () => import("./pages/admin/SessionManagementPage"),
);
const TimetableManagementPage = lazy(
  () => import("./pages/admin/TimetableManagementPage"),
);
const ReportCardPage = lazy(() => import("./pages/admin/ReportCardPage"));
const AdminMarkEntriesPage = lazy(
  () => import("./pages/admin/MarkEntriesPage"),
);
const EnrollmentPage = lazy(() => import("./pages/admin/EnrollmentPage"));
const ParentManagementPage = lazy(
  () => import("./pages/admin/ParentManagementPage"),
);
const UserManagementPage = lazy(
  () => import("./pages/admin/UserManagementPage"),
);
const ClassSubjectPage = lazy(() => import("./pages/admin/ClassSubjectPage"));
const PromotionPage = lazy(() => import("./pages/admin/PromotionPage"));
const TeacherAssignmentPage = lazy(
  () => import("./pages/admin/TeacherAssignmentPage"),
);
const SettingsPage = lazy(() => import("./pages/admin/SettingsPage"));
const TermManagementPage = lazy(
  () => import("./pages/admin/TermManagementPage"),
);

// Teacher Pages
const TeacherDashboardPage = lazy(
  () => import("./pages/teacher/DashboardPage"),
);
const TeacherMyClassesPage = lazy(
  () => import("./pages/teacher/MyClassesPage"),
);
const TeacherMySubjectsPage = lazy(
  () => import("./pages/teacher/MySubjectsPage"),
);
const TeacherAssessmentPage = lazy(
  () => import("./pages/teacher/AssessmentPage"),
);
const TeacherAttemptsPage = lazy(() => import("./pages/teacher/AttemptsPage"));
const TeacherAttendancePage = lazy(
  () => import("./pages/teacher/AttendancePage"),
);
const TeacherLessonPlanPage = lazy(
  () => import("./pages/teacher/LessonPlanPage"),
);
const TeacherQuestionBankPage = lazy(
  () => import("./pages/teacher/QuestionBankPage"),
);
const TeacherReportCardPage = lazy(
  () => import("./pages/teacher/ReportCardPage"),
);
const TeacherMarkEntriesPage = lazy(
  () => import("./pages/teacher/MarkEntriesPage"),
);
const TeacherStudentListPage = lazy(
  () => import("./pages/teacher/StudentListPage"),
);
// const TeacherViewResultsPage = lazy(() => import("./pages/teacher/ViewResultsPage"));

// Student Pages
const StudentDashboardPage = lazy(
  () => import("./pages/student/DashboardPage"),
);
const StudentMyClassesPage = lazy(
  () => import("./pages/student/MyClassesPage"),
);
const StudentMySubjectsPage = lazy(
  () => import("./pages/student/MySubjectsPage"),
);
const StudentMyAssessmentsPage = lazy(
  () => import("./pages/student/MyAssessmentsPage"),
);
const StudentMyLessonsPage = lazy(
  () => import("./pages/student/MyLessonsPage"),
);
const StudentMyResultsPage = lazy(
  () => import("./pages/student/MyResultsPage"),
);
const StudentAttendancePage = lazy(
  () => import("./pages/student/AttendancePage"),
);
const StudentReportCardPage = lazy(
  () => import("./pages/student/ReportCardPage"),
);
const StudentTakeAssessmentPage = lazy(
  () => import("./pages/student/TakeAssessmentPage"),
);
const MyTimetablePage = lazy(() => import("./pages/shared/MyTimetablePage"));

// Parent Pages
const ParentDashboardPage = lazy(() => import("./pages/parent/DashboardPage"));
const ParentChildrenPage = lazy(() => import("./pages/parent/ChildrenPage"));
const ParentChildAssessmentsPage = lazy(
  () => import("./pages/parent/ChildAssessmentsPage"),
);
const ParentChildAttendancePage = lazy(
  () => import("./pages/parent/ChildAttendancePage"),
);
const ParentChildReportCardPage = lazy(
  () => import("./pages/parent/ChildReportCardPage"),
);
const ParentChildResultsPage = lazy(
  () => import("./pages/parent/ChildResultsPage"),
);

// Auth Pages (the backend only supports login: accounts are created by admins)
import LoginPage from "./pages/auth/LoginPage";

// Error Pages — kept eager: small, shared across every role, and may need
// to render even if a lazy chunk itself fails to load.
import NotFoundPage from "./pages/errors/NotFoundPage";
import ForbiddenPage from "./pages/errors/ForbiddenPage";
import ServerErrorPage from "./pages/errors/ServerErrorPage";

// Route Guards & Shared Pages
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import ProfilePage from "./pages/shared/ProfilePage";
import AnnouncementsPage from "./pages/shared/AnnouncementsPage";
import NotificationsPage from "./pages/shared/NotificationsPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={<Loader text="Loading..." />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
              </Route>

              {/* Error Routes */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="/403" element={<ForbiddenPage />} />
              <Route path="/500" element={<ServerErrorPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                {/* Admin Routes */}
                <Route element={<RoleRoute allowedRoles={["admin"]} />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route
                      index
                      element={<Navigate to="dashboard" replace />}
                    />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route
                      path="students"
                      element={<StudentManagementPage />}
                    />
                    <Route
                      path="teachers"
                      element={<TeacherManagementPage />}
                    />
                    <Route path="classes" element={<ClassManagementPage />} />
                    <Route
                      path="subjects"
                      element={<SubjectManagementPage />}
                    />
                    <Route
                      path="attendance"
                      element={<AttendanceOverviewPage />}
                    />
                    <Route
                      path="assessments"
                      element={<AssessmentManagementPage />}
                    />
                    <Route
                      path="announcements"
                      element={<AnnouncementManagementPage />}
                    />
                    <Route
                      path="sessions"
                      element={<SessionManagementPage />}
                    />
                    <Route path="reports" element={<ReportCardPage />} />
                    <Route
                      path="mark-entries"
                      element={<AdminMarkEntriesPage />}
                    />
                    <Route path="enrollments" element={<EnrollmentPage />} />
                    <Route path="parents" element={<ParentManagementPage />} />
                    <Route path="users" element={<UserManagementPage />} />
                    <Route
                      path="class-subjects"
                      element={<ClassSubjectPage />}
                    />
                    <Route path="promotions" element={<PromotionPage />} />
                    <Route
                      path="teacher-assignments"
                      element={<TeacherAssignmentPage />}
                    />
                    <Route path="terms" element={<TermManagementPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route
                      path="timetable"
                      element={<TimetableManagementPage />}
                    />
                    <Route
                      path="notifications"
                      element={<NotificationsPage />}
                    />
                    <Route path="profile" element={<ProfilePage />} />
                  </Route>
                </Route>

                {/* Teacher Routes */}
                <Route element={<RoleRoute allowedRoles={["teacher"]} />}>
                  <Route path="/teacher" element={<TeacherLayout />}>
                    <Route
                      index
                      element={<Navigate to="dashboard" replace />}
                    />
                    <Route
                      path="dashboard"
                      element={<TeacherDashboardPage />}
                    />
                    <Route
                      path="my-classes"
                      element={<TeacherMyClassesPage />}
                    />
                    <Route
                      path="my-subjects"
                      element={<TeacherMySubjectsPage />}
                    />
                    <Route
                      path="assessments"
                      element={<TeacherAssessmentPage />}
                    />
                    <Route path="attempts" element={<TeacherAttemptsPage />} />
                    <Route
                      path="attendance"
                      element={<TeacherAttendancePage />}
                    />
                    <Route
                      path="lesson-plans"
                      element={<TeacherLessonPlanPage />}
                    />
                    <Route
                      path="question-bank"
                      element={<TeacherQuestionBankPage />}
                    />
                    <Route
                      path="report-cards"
                      element={<TeacherReportCardPage />}
                    />
                    <Route
                      path="mark-entries"
                      element={<TeacherMarkEntriesPage />}
                    />
                    <Route
                      path="students"
                      element={<TeacherStudentListPage />}
                    />
                    {/* <Route path="results" element={<TeacherViewResultsPage />} /> */}
                    <Route path="timetable" element={<MyTimetablePage />} />
                    <Route
                      path="announcements"
                      element={<AnnouncementsPage />}
                    />
                    <Route
                      path="notifications"
                      element={<NotificationsPage />}
                    />
                    <Route path="profile" element={<ProfilePage />} />
                  </Route>
                </Route>

                {/* Student Routes */}
                <Route element={<RoleRoute allowedRoles={["student"]} />}>
                  <Route path="/student" element={<StudentLayout />}>
                    <Route
                      index
                      element={<Navigate to="dashboard" replace />}
                    />
                    <Route
                      path="dashboard"
                      element={<StudentDashboardPage />}
                    />
                    <Route
                      path="my-classes"
                      element={<StudentMyClassesPage />}
                    />
                    <Route
                      path="my-subjects"
                      element={<StudentMySubjectsPage />}
                    />
                    <Route
                      path="my-assessments"
                      element={<StudentMyAssessmentsPage />}
                    />
                    <Route
                      path="my-lessons"
                      element={<StudentMyLessonsPage />}
                    />
                    <Route
                      path="my-results"
                      element={<StudentMyResultsPage />}
                    />
                    <Route
                      path="attendance"
                      element={<StudentAttendancePage />}
                    />
                    <Route
                      path="report-cards"
                      element={<StudentReportCardPage />}
                    />
                    <Route
                      path="take-assessment"
                      element={<StudentTakeAssessmentPage />}
                    />
                    <Route path="timetable" element={<MyTimetablePage />} />
                    <Route
                      path="announcements"
                      element={<AnnouncementsPage />}
                    />
                    <Route
                      path="notifications"
                      element={<NotificationsPage />}
                    />
                    <Route path="profile" element={<ProfilePage />} />
                  </Route>
                </Route>

                {/* Parent Routes */}
                <Route element={<RoleRoute allowedRoles={["parent"]} />}>
                  <Route path="/parent" element={<ParentLayout />}>
                    <Route
                      index
                      element={<Navigate to="dashboard" replace />}
                    />
                    <Route path="dashboard" element={<ParentDashboardPage />} />
                    <Route path="children" element={<ParentChildrenPage />} />
                    <Route
                      path="child-assessments"
                      element={<ParentChildAssessmentsPage />}
                    />
                    <Route
                      path="child-attendance"
                      element={<ParentChildAttendancePage />}
                    />
                    <Route
                      path="child-report-cards"
                      element={<ParentChildReportCardPage />}
                    />
                    <Route
                      path="child-results"
                      element={<ParentChildResultsPage />}
                    />
                    <Route path="timetable" element={<MyTimetablePage />} />
                    <Route
                      path="announcements"
                      element={<AnnouncementsPage />}
                    />
                    <Route
                      path="notifications"
                      element={<NotificationsPage />}
                    />
                    <Route path="profile" element={<ProfilePage />} />
                  </Route>
                </Route>
              </Route>

              {/* Catch-all route for 404 */}
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
