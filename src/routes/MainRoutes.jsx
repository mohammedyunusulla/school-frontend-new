import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import ProtectedRoute from './ProtectedRoute';

// dashboard routing
const Dashboard = Loadable(lazy(() => import('views/dashboard/Dashboard')));

const SchoolCreateOrUpdate = Loadable(lazy(() => import('../views/pages/school_management/SchoolCreateOrUpdate')));
const SchoolsList = Loadable(lazy(() => import('../views/pages/school_management/SchoolsList')));
const SchoolAdminsList = Loadable(lazy(() => import('../views/pages/school_management/SchoolAdminsList')));
const TeacherManagement = Loadable(lazy(() => import('../views/pages/teacher/TeacherManagement')));
const TeacherCreateOrUpdate = Loadable(lazy(() => import('../views/pages/teacher/TeacherCreateOrUpdate')));
const TeacherProfileEdit = Loadable(lazy(() => import('../views/pages/teacher/TeacherProfileEdit')));
const StudentManagement = Loadable(lazy(() => import('../views/pages/student/StudentManagement')));
const StudentSingleOrBulkTabPanel = Loadable(lazy(() => import('../views/pages/student/StudentSingleOrBulkTabPanel')));
const ParentManagement = Loadable(lazy(() => import('../views/pages/parent/ParentManagement')));
const ParentCreateOrUpdate = Loadable(lazy(() => import('../views/pages/parent/ParentCreateOrUpdate')));
const SchoolUsersList = Loadable(lazy(() => import('../views/pages/school_admin/SchoolUserList')));
const Classes = Loadable(lazy(() => import('../views/pages/classes-sections/Classes')));
const ClassSubjects = Loadable(lazy(() => import('../views/pages/classes-sections/ClassSubjects')));
const SectionStudents = Loadable(lazy(() => import('../views/pages/classes-sections/SectionStudents')));
const SectionSubjects = Loadable(lazy(() => import('../views/pages/classes-sections/SectionSubjects')));
const Subjects = Loadable(lazy(() => import('../views/pages/subjects/Subjects')));
const TeacherSubject = Loadable(lazy(() => import('../views/pages/teacher/TeacherSubject')));
const RolesAndPermissions = Loadable(lazy(() => import('../views/pages/roles-permissions/RolesAndPermissions')));
const Timetable = Loadable(lazy(() => import('../views/pages/timetable/Timetable')));
const TimetableManagement = Loadable(lazy(() => import('../views/pages/timetable/TimetableManagement')));
const AttendanceMark = Loadable(lazy(() => import('../views/pages/attendance/AttendenceMark')));
const SalarySetupList = Loadable(lazy(() => import('../views/pages/expense_management/SalarySetupList')));
const SalaryPaymentGeneration = Loadable(lazy(() => import('../views/pages/expense_management/SalaryPaymentGeneration')));
const ExpenseList = Loadable(lazy(() => import('../views/pages/expense_management/ExpenseList')));
const ClassProgressView = Loadable(lazy(() => import('../views/pages/progress_cards/ClassProgressView')));
const ProgressCardView = Loadable(lazy(() => import('../views/pages/progress_cards/ProgressCardView')));
const FeeStructureList = lazy(() => import('../views/pages/fees/FeeStructureList'));
const FeeCollection = lazy(() => import('../views/pages/fees/FeeCollection'));
const FeeStructureCreate = lazy(() => import('../views/pages/fees/FeeStructureCreate'));
const AttendanceView = lazy(() => import('../views/pages/attendance/AttendanceView'));
const TimetableView = lazy(() => import('../views/pages/timetable/TimetableView'));
const TimetableEdit = lazy(() => import('../views/pages/timetable/TimetableEdit'));
const AnnouncementList = lazy(() => import('../views/pages/notices/AnnouncementList'));
const CreateAnnouncement = lazy(() => import('../views/pages/notices/CreateAnnouncement'));
const MarksEntry = lazy(() => import('../views/pages/marks_entry/MarksEntry'));
const ExamTypesManagement = lazy(() => import('../views/pages/exams_management/ExamTypesManagement'));
const ExamSubjectConfiguration = lazy(() => import('../views/pages/exams_management/ExamSubjectConfiguration'));


// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: 'dashboard',
      element: <Dashboard />
    },
    // {
    //   path: 'dashboard',
    //   children: [
    //     {
    //       path: 'default',
    //       element: <DashboardDefault />
    //     }
    //   ]
    // },

    {
      path: "/school/create",
      element: <ProtectedRoute> <SchoolCreateOrUpdate /></ProtectedRoute>
    },
    {
      path: "/school/update",
      element: <ProtectedRoute> <SchoolCreateOrUpdate /></ProtectedRoute>
    },
    {
      path: "/school/list",
      element: <ProtectedRoute> <SchoolsList /></ProtectedRoute>
    },
    {
      path: "/school/list/school-admins",
      element: <ProtectedRoute> <SchoolAdminsList /></ProtectedRoute>
    },

    {
      path: "/teacher/list",
      element: <TeacherManagement />
    },
    {
      path: "/teacher/create",
      element: <TeacherCreateOrUpdate />
    },
    {
      path: "/teacher/update",
      element: <TeacherCreateOrUpdate />
    },
    { path: '/teacher/profile/edit', element: <TeacherProfileEdit /> },

    {
      path: "/student/list",
      element: <StudentManagement />
    },
    {
      path: "/student/create",
      element: <StudentSingleOrBulkTabPanel />
    },
    {
      path: "/student/update/:studentId",
      element: <StudentSingleOrBulkTabPanel />
    },
    {
      path: "/parent/list",
      element: <ParentManagement />
    },
    {
      path: "/parent/create",
      element: <ParentCreateOrUpdate />
    },
    {
      path: "/parent/update",
      element: <ParentCreateOrUpdate />
    },
    {
      path: "/classes",
      element: <Classes />
    },
    {
      path: "/section/:sectionId/students",
      element: <SectionStudents />
    },
    {
      path: "/class/:classId/subjects",
      element: <ClassSubjects />
    },
    {
      path: "/section/:sectionId/subjects",
      element: <SectionSubjects />
    },
    {
      path: "/subjects",
      element: <Subjects />
    },
    {
      path: "/teacher-subjects",
      element: <TeacherSubject />
    },
    {
      path: "/announcements/list",
      element: <AnnouncementList />
    },
    {
      path: "/announcements/create",
      element: <CreateAnnouncement />
    },
    {
      path: "/school/users/list",
      element: <SchoolUsersList />
    },
    {
      path: "/attendance/view",
      element: <AttendanceView />
    },
    {
      path: "/attendance/mark",
      element: <AttendanceMark />
    },
    {
      path: "/attendance/mark?date=:date&class=:class&section:section",
      element: <AttendanceMark />
    },
    // TimeTables
    {
      path: "/timetable/list",
      element: <TimetableManagement />
    },
    {
      path: "/timetable/create",
      element: <Timetable />
    },
    {
      path: "/timetable/edit/:id",
      element: <TimetableEdit />
    },
    {
      path: "/timetable/view/:id",
      element: <TimetableView />
    },
    {
      path: "/roles-and-permissions",
      element: <RolesAndPermissions />
    },
    {
      path: "/fee/structures",
      element: <FeeStructureList />
    },
    {
      path: "/fee/structure/create",
      element: <FeeStructureCreate />
    },
    {
      path: "/fee/structure/edit/:class_id",
      element: <FeeStructureCreate />
    },
    {
      path: "/fee/collection",
      element: <FeeCollection />
    },
    // {
    //   path: "/fee/reports",
    //   element: <FeeStructureList />
    // },
    {
      path: "/exams/types",
      element: <ExamTypesManagement />
    },
    {
      path: "/exams/subjects",
      element: <ExamSubjectConfiguration />
    },
    {
      path: "/marks/entry",
      element: <MarksEntry />
    },
    {
      path: "/progress/view",
      element: <ClassProgressView />
    },
    {
      path: "/progress-card/view/:studentId/:examId",
      element: <ProgressCardView />
    },
    // Expenses Management
    {
      path: "/expense/List",
      element: <ExpenseList />
    },
    {
      path: "/expense/Salary-payment-generation",
      element: <SalaryPaymentGeneration />
    },
    {
      path: "/salary-setup",
      element: <SalarySetupList />
    },

  ]
};

export default MainRoutes;
