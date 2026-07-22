import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AdminLayout from "./layouts/AdminLayout";
import TeacherLayout from "./layouts/TeacherLayout";
import StudentLayout from "./layouts/StudentLayout";
import ParentLayout from "./layouts/ParentLayout";
import AuthLayout from "./layouts/AuthLayout";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";

// Admin Pages
import DashboardPage from "./pages/admin/DashboardPage";
import StudentManagementPage from "./pages/admin/StudentManagementPage";
import TeacherManagementPage from "./pages/admin/TeacherManagementPage";
import ClassManagementPage from "./pages/admin/ClassManagementPage";
import SubjectManagementPage from "./pages/admin/SubjectManagementPage";
import AttendanceOverviewPage from "./pages/admin/AttendanceOverviewPage";
import AssessmentManagementPage from "./pages/admin/AssessmentManagementPage";
import AnnouncementManagementPage from "./pages/admin/AnnouncementManagementPage";
import SessionManagementPage from "./pages/admin/SessionManagementPage";
import ReportCardPage from "./pages/admin/ReportCardPage";
import EnrollmentPage from "./pages/admin/EnrollmentPage";
import ParentManagementPage from "./pages/admin/ParentManagementPage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import ClassSubjectPage from "./pages/admin/ClassSubjectPage";
import PromotionPage from "./pages/admin/PromotionPage";
import TeacherAssignmentPage from "./pages/admin/TeacherAssignmentPage";
import TermManagementPage from "./pages/admin/TermManagementPage";

// Teacher Pages
import TeacherDashboardPage from "./pages/teacher/TeacherDashboardPage";
import TeacherMyClassesPage from "./pages/teacher/MyClassesPage";
import TeacherMySubjectsPage from "./pages/teacher/MySubjectsPage";
import TeacherAssessmentPage from "./pages/teacher/AssessmentPage";
import TeacherAttendancePage from "./pages/teacher/AttendancePage";
import TeacherGradeAssessmentPage from "./pages/teacher/GradeAssessmentPage";
import TeacherLessonPlanPage from "./pages/teacher/LessonPlanPage";
import TeacherQuestionBankPage from "./pages/teacher/QuestionBankPage";
import TeacherReportCardPage from "./pages/teacher/ReportCardPage";
import TeacherStudentListPage from "./pages/teacher/StudentListPage";
import TeacherViewResultsPage from "./pages/teacher/ViewResultsPage";

// Student Pages
import StudentDashboardPage from "./pages/student/DashboardPage";
import StudentMyClassesPage from "./pages/student/MyClassesPage";
import StudentMySubjectsPage from "./pages/student/MySubjectsPage";
import StudentMyAssessmentsPage from "./pages/student/MyAssessmentsPage";
import StudentMyLessonsPage from "./pages/student/MyLessonsPage";
import StudentMyResultsPage from "./pages/student/MyResultsPage";
import StudentMyTimetablePage from "./pages/student/MyTimetablePage";
import StudentAttendancePage from "./pages/student/AttendancePage";
import StudentReportCardPage from "./pages/student/ReportCardPage";
import StudentTakeAssessmentPage from "./pages/student/TakeAssessmentPage";

// Parent Pages
import ParentDashboardPage from "./pages/parent/DashboardPage";
import ParentChildrenPage from "./pages/parent/ChildrenPage";
import ParentChildAssessmentsPage from "./pages/parent/ChildAssessmentsPage";
import ParentChildAttendancePage from "./pages/parent/ChildAttendancePage";
import ParentChildLessonsPage from "./pages/parent/ChildLessonsPage";
import ParentChildReportCardPage from "./pages/parent/ChildReportCardPage";
import ParentChildResultsPage from "./pages/parent/ChildResultsPage";
import ParentMessageTeacherPage from "./pages/parent/MessageTeacherPage";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import VerifyOTPPage from "./pages/auth/VerifyOTPPage";

// Error Pages
import NotFoundPage from "./pages/errors/NotFoundPage";
import ForbiddenPage from "./pages/errors/ForbiddenPage";
import ServerErrorPage from "./pages/errors/ServerErrorPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route
                path="/reset-password/:token"
                element={<ResetPasswordPage />}
              />
              <Route path="/verify-otp" element={<VerifyOTPPage />} />
            </Route>

            {/* Error Routes */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="/403" element={<ForbiddenPage />} />
            <Route path="/500" element={<ServerErrorPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="students" element={<StudentManagementPage />} />
              <Route path="teachers" element={<TeacherManagementPage />} />
              <Route path="classes" element={<ClassManagementPage />} />
              <Route path="subjects" element={<SubjectManagementPage />} />
              <Route path="attendance" element={<AttendanceOverviewPage />} />
              <Route path="assessments" element={<AssessmentManagementPage />} />
              <Route
                path="announcements"
                element={<AnnouncementManagementPage />}
              />
              <Route path="sessions" element={<SessionManagementPage />} />
              <Route path="reports" element={<ReportCardPage />} />
              <Route path="enrollments" element={<EnrollmentPage />} />
              <Route path="parents" element={<ParentManagementPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="class-subjects" element={<ClassSubjectPage />} />
              <Route path="promotions" element={<PromotionPage />} />
              <Route
                path="teacher-assignments"
                element={<TeacherAssignmentPage />}
              />
              <Route path="terms" element={<TermManagementPage />} />
            </Route>

            {/* Teacher Routes */}
            <Route path="/teacher" element={<TeacherLayout />}>
              <Route path="dashboard" element={<TeacherDashboardPage />} />
              <Route path="my-classes" element={<TeacherMyClassesPage />} />
              <Route path="my-subjects" element={<TeacherMySubjectsPage />} />
              <Route path="assessments" element={<TeacherAssessmentPage />} />
              <Route path="attendance" element={<TeacherAttendancePage />} />
              <Route
                path="grade-assessments"
                element={<TeacherGradeAssessmentPage />}
              />
              <Route path="lesson-plans" element={<TeacherLessonPlanPage />} />
              <Route path="question-bank" element={<TeacherQuestionBankPage />} />
              <Route path="report-cards" element={<TeacherReportCardPage />} />
              <Route path="students" element={<TeacherStudentListPage />} />
              <Route path="results" element={<TeacherViewResultsPage />} />
            </Route>

            {/* Student Routes */}
            <Route path="/student" element={<StudentLayout />}>
              <Route path="dashboard" element={<StudentDashboardPage />} />
              <Route path="my-classes" element={<StudentMyClassesPage />} />
              <Route path="my-subjects" element={<StudentMySubjectsPage />} />
              <Route
                path="my-assessments"
                element={<StudentMyAssessmentsPage />}
              />
              <Route path="my-lessons" element={<StudentMyLessonsPage />} />
              <Route path="my-results" element={<StudentMyResultsPage />} />
              <Route path="my-timetable" element={<StudentMyTimetablePage />} />
              <Route path="attendance" element={<StudentAttendancePage />} />
              <Route path="report-cards" element={<StudentReportCardPage />} />
              <Route
                path="take-assessment"
                element={<StudentTakeAssessmentPage />}
              />
            </Route>

            {/* Parent Routes */}
            <Route path="/parent" element={<ParentLayout />}>
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
              <Route path="child-lessons" element={<ParentChildLessonsPage />} />
              <Route
                path="child-report-cards"
                element={<ParentChildReportCardPage />}
              />
              <Route path="child-results" element={<ParentChildResultsPage />} />
              <Route
                path="message-teacher"
                element={<ParentMessageTeacherPage />}
              />
            </Route>

            {/* Catch-all route for 404 */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </ErrorBoundary>
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
