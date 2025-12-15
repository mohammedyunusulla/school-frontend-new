import {
    IconUsers, IconSchool, IconUserPlus, IconBuildingBank, IconCalendarEvent, IconClipboardList, IconBook,
    IconChartBar, IconFileText, IconCurrencyDollar, IconSettings, IconSpeakerphone, IconUserCheck, IconShield
} from '@tabler/icons-react';

// Navigation items configuration
export const navigationItems = [
    // Students
    {
        title: 'Student List',
        path: '/student/list',
        icon: IconUsers,
        description: 'View and manage all student records',
        keywords: ['student', 'list', 'view', 'manage']
    },
    {
        title: 'Create Student',
        path: '/student/create',
        icon: IconUserPlus,
        description: 'Create a new student record',
        keywords: ['student', 'create', 'add', 'new', 'register']
    },

    // Teachers
    {
        title: 'Teacher List',
        path: '/teacher/list',
        icon: IconSchool,
        description: 'View and manage all teacher records',
        keywords: ['teacher', 'list', 'view', 'manage', 'staff']
    },
    {
        title: 'Create Teacher',
        path: '/teacher/create',
        icon: IconUserPlus,
        description: 'Create a new teacher record',
        keywords: ['teacher', 'create', 'add', 'new', 'staff']
    },
    {
        title: 'Teacher Profile Edit',
        path: '/teacher/profile/edit',
        icon: IconSettings,
        description: 'Edit your teacher profile information',
        keywords: ['teacher', 'profile', 'edit', 'update']
    },

    // Parents
    {
        title: 'Parent List',
        path: '/parent/list',
        icon: IconUsers,
        description: 'View and manage all parent records',
        keywords: ['parent', 'list', 'view', 'manage']
    },
    {
        title: 'Create Parent',
        path: '/parent/create',
        icon: IconUserPlus,
        description: 'Create a new parent record',
        keywords: ['parent', 'create', 'add', 'new']
    },

    // Classes & Subjects
    {
        title: 'Classes',
        path: '/classes',
        icon: IconBuildingBank,
        description: 'Manage classes and sections',
        keywords: ['class', 'classes', 'sections', 'manage']
    },
    {
        title: 'Subjects',
        path: '/subjects',
        icon: IconBook,
        description: 'Manage school subjects and curriculum',
        keywords: ['subject', 'subjects', 'curriculum']
    },
    {
        title: 'Teacher Subjects',
        path: '/teacher-subjects',
        icon: IconBook,
        description: 'Assign subjects to teachers',
        keywords: ['teacher', 'subject', 'assignment', 'allocation']
    },

    // Attendance
    {
        title: 'View Attendance',
        path: '/attendance/view',
        icon: IconClipboardList,
        description: 'View attendance reports and records',
        keywords: ['attendance', 'view', 'report']
    },
    {
        title: 'Mark Attendance',
        path: '/attendance/mark',
        icon: IconUserCheck,
        description: 'Mark student attendance for classes',
        keywords: ['attendance', 'mark', 'take', 'record']
    },

    // Timetable
    {
        title: 'Timetable List',
        path: '/timetable/list',
        icon: IconCalendarEvent,
        description: 'View all class timetables',
        keywords: ['timetable', 'schedule', 'list']
    },
    {
        title: 'Create Timetable',
        path: '/timetable/create',
        icon: IconCalendarEvent,
        description: 'Create a new class timetable',
        keywords: ['timetable', 'create', 'schedule', 'new']
    },

    // Fee Management
    {
        title: 'Fee Structures',
        path: '/fee/structures',
        icon: IconCurrencyDollar,
        description: 'View and manage fee structures',
        keywords: ['fee', 'structure', 'payment', 'tuition']
    },
    {
        title: 'Create Fee Structure',
        path: '/fee/structure/create',
        icon: IconCurrencyDollar,
        description: 'Create a new fee structure',
        keywords: ['fee', 'structure', 'create', 'new']
    },
    {
        title: 'Fee Collection',
        path: '/fee/collection',
        icon: IconCurrencyDollar,
        description: 'Collect and manage fee payments',
        keywords: ['fee', 'collection', 'payment', 'collect']
    },

    // Exams & Marks
    {
        title: 'Exam Types',
        path: '/exams/types',
        icon: IconFileText,
        description: 'Manage exam types and assessments',
        keywords: ['exam', 'type', 'assessment', 'test']
    },
    {
        title: 'Exam Subjects',
        path: '/exams/subjects',
        icon: IconFileText,
        description: 'Configure exam subjects and weightage',
        keywords: ['exam', 'subject', 'configuration']
    },
    {
        title: 'Marks Entry',
        path: '/marks/entry',
        icon: IconFileText,
        description: 'Enter student marks and grades',
        keywords: ['marks', 'entry', 'grades', 'score']
    },
    {
        title: 'Class Progress View',
        path: '/progress/view',
        icon: IconChartBar,
        description: 'View class performance and progress reports',
        keywords: ['progress', 'report', 'results', 'performance']
    },

    // Expenses
    {
        title: 'Expense List',
        path: '/expense/List',
        icon: IconCurrencyDollar,
        description: 'View and manage school expenses',
        keywords: ['expense', 'expenditure', 'list']
    },
    {
        title: 'Salary Payment Generation',
        path: '/expense/Salary-payment-generation',
        icon: IconCurrencyDollar,
        description: 'Generate salary payments for staff',
        keywords: ['salary', 'payment', 'payroll', 'generate']
    },
    {
        title: 'Salary Setup',
        path: '/salary-setup',
        icon: IconCurrencyDollar,
        description: 'Configure salary structures and components',
        keywords: ['salary', 'setup', 'configure', 'payroll']
    },

    // Announcements
    {
        title: 'Announcements List',
        path: '/announcements/list',
        icon: IconSpeakerphone,
        description: 'View all school announcements',
        keywords: ['announcement', 'notice', 'list']
    },
    {
        title: 'Create Announcement',
        path: '/announcements/create',
        icon: IconSpeakerphone,
        description: 'Create a new school announcement',
        keywords: ['announcement', 'create', 'notice', 'new']
    },

    // School Users & Permissions
    {
        title: 'School Users List',
        path: '/school/users/list',
        icon: IconUsers,
        description: 'Manage school users and staff accounts',
        keywords: ['users', 'staff', 'list', 'manage']
    },
    {
        title: 'Roles & Permissions',
        path: '/roles-and-permissions',
        icon: IconShield,
        description: 'Configure user roles and access permissions',
        keywords: ['roles', 'permissions', 'access', 'rights']
    }
];