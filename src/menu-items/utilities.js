// assets
import {
    IconTypography, IconPalette, IconShadow, IconWindmill, IconUser, IconUsers,
    IconPlus, IconList, IconListNumbers, IconUserPlus, IconUsersPlus,
    IconSchool, IconBook, IconShieldBolt, IconCalendarTime, IconUserCheck, IconUsersGroup,
    IconSpeakerphone, IconSettingsAutomation, IconReport
} from '@tabler/icons-react';

// constant
const icons = {
    IconTypography, IconPalette, IconShadow, IconWindmill, IconPlus, IconList, IconUser, IconUsers,
    IconListNumbers, IconUserPlus, IconUsersPlus, IconSchool, IconBook, IconShieldBolt, IconCalendarTime,
    IconUserCheck, IconUsersGroup, IconSpeakerphone, IconSettingsAutomation, IconReport
};

// ==============================|| UTILITIES MENU ITEMS ||============================== //

const utilities = {
    id: '',
    title: '',
    type: 'group',
    children: [
        // School Management - Create, List
        {
            id: 'create-school',
            title: 'Create School',
            type: 'collapse',
            icon: icons.IconPlus,
            breadcrumbs: false,
            roles: ['SUPER_ADMIN'],
            children: [
                {
                    id: 'create-school',
                    title: 'Create School',
                    type: 'item',
                    url: '/school/create',
                    // icon: icons.IconPlus,
                    breadcrumbs: false,
                    roles: ['SUPER_ADMIN'],
                },
                {
                    id: 'list-school',
                    title: 'List',
                    type: 'item',
                    url: '/school/list',
                    // icon: icons.IconList,
                    breadcrumbs: false,
                    roles: ['SUPER_ADMIN'],
                },
                {
                    id: 'school-admins-list',
                    title: 'School Admins',
                    type: 'item',
                    url: '/school/list/school-admins',
                    // icon: icons.IconList,
                    breadcrumbs: false,
                    roles: ['SUPER_ADMIN'],
                },
            ]
        },

        {
            id: 'attendence-view',
            title: 'Attendence',
            type: 'item',
            url: '/attendance/view',
            icon: icons.IconUserCheck,
            breadcrumbs: false,
            roles: ['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'],
        },
        {
            id: 'announcements',
            title: 'Announcements',
            type: 'item',
            url: '/announcements/list',
            icon: icons.IconSpeakerphone,
            breadcrumbs: false,
            roles: ['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT'],
        },
        {
            id: 'timetable-management',
            title: 'Timetable',
            type: 'item',
            url: '/timetable/list',
            icon: icons.IconCalendarTime,
            breadcrumbs: false,
            roles: ['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'],
        },

        // User Management - Users, Teachers, Students, Parents -> CRUD + list
        {
            id: 'user-management',
            title: 'User Management',
            type: 'collapse',
            icon: icons.IconUser,
            breadcrumbs: false,
            roles: ['SCHOOL_ADMIN'],
            children: [
                {
                    id: 'user-list',
                    title: 'Users List',
                    type: 'item',
                    url: '/school/users/list',
                    // icon: icons.IconListNumbers,
                    breadcrumbs: false,
                    roles: ['SCHOOL_ADMIN', 'PRINCIPAL'],
                },
                {
                    id: 'teacher-management',
                    title: 'Teachers',
                    type: 'item',
                    url: '/teacher/list',
                    // icon: icons.IconUser,
                    breadcrumbs: false,
                    roles: ['SCHOOL_ADMIN', 'PRINCIPAL'],
                },
                {
                    id: 'student-management',
                    title: 'Students',
                    type: 'item',
                    url: '/student/list',
                    // icon: icons.IconUsers,
                    breadcrumbs: false,
                    roles: ['SCHOOL_ADMIN', 'PRINCIPAL'],
                },
                {
                    id: 'parent-management',
                    title: 'Parents',
                    type: 'item',
                    url: '/parent/list',
                    // icon: icons.IconUsersGroup,
                    breadcrumbs: false,
                    roles: ['SCHOOL_ADMIN', 'PRINCIPAL'],
                },
                {
                    id: 'roles-and-permissions',
                    title: 'Roles & Permissions',
                    type: 'item',
                    url: '/roles-and-permissions',
                    // icon: icons.IconShieldBolt,
                    breadcrumbs: false,
                    roles: ['SCHOOL_ADMIN', 'PRINCIPAL'],
                },
            ]
        },

        // Class and Subject Management - Class, Sections, Subject, teacher-subject assign -> CRUD + list
        {
            id: 'class-management',
            title: 'Class Management',
            type: 'collapse',
            icon: icons.IconSchool,
            breadcrumbs: false,
            roles: ['SCHOOL_ADMIN', 'PRINCIPAL'],
            children: [
                {
                    id: 'classes',
                    title: 'Classes',
                    type: 'item',
                    url: '/classes',
                    // icon: icons.IconSchool,
                    breadcrumbs: false,
                    roles: ['SCHOOL_ADMIN', 'PRINCIPAL'],
                },
                {
                    id: 'subjects',
                    title: 'Subjects',
                    type: 'item',
                    url: '/subjects',
                    // icon: icons.IconBook,
                    breadcrumbs: false,
                    roles: ['SCHOOL_ADMIN', 'PRINCIPAL'],
                },
                {
                    id: 'teacher-subjects',
                    title: 'Teacher-Subjects',
                    type: 'item',
                    url: '/teacher-subjects',
                    // icon: icons.IconBook,
                    breadcrumbs: false,
                    roles: ['SCHOOL_ADMIN', 'PRINCIPAL'],
                },
            ]
        },

        // Exam configs - exam types -> CRUD + list, Exam-sub 
        {
            id: 'exam-configurations',
            title: 'Exam Configurations',
            type: 'collapse',
            icon: icons.IconSettingsAutomation,
            breadcrumbs: false,
            roles: ['SCHOOL_ADMIN', 'PRINCIPAL'],
            children: [
                {
                    id: 'exams-types',
                    title: 'Exams Config',
                    type: 'item',
                    url: '/exams/types',
                    // icon: icons.IconSettingsAutomation,
                    breadcrumbs: false,
                    roles: ['SCHOOL_ADMIN', 'PRINCIPAL'],
                },
                {
                    id: 'exams-subjects',
                    title: 'Exams-sub config',
                    type: 'item',
                    url: '/exams/subjects',
                    // icon: icons.IconSettingsAutomation,
                    breadcrumbs: false,
                    roles: ['SCHOOL_ADMIN', 'PRINCIPAL'],
                },
            ]
        },

        // Academics Management - Marks entry, progress report 
        {
            id: 'academics-management',
            title: 'Academics Management',
            type: 'collapse',
            icon: icons.IconReport,
            breadcrumbs: false,
            roles: ['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'],
            children: [
                {
                    id: 'marks-entry',
                    title: 'Marks Entry',
                    type: 'item',
                    url: '/marks/entry',
                    // icon: icons.IconReport,
                    breadcrumbs: false,
                    roles: ['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'],
                },
                {
                    id: 'progress-view',
                    title: 'Progress View',
                    type: 'item',
                    url: '/progress/view',
                    // icon: icons.IconReport,
                    breadcrumbs: false,
                    roles: ['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'],
                },
            ]
        },
    ]
};

export default utilities;
