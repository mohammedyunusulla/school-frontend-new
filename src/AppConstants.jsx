export const labelStyles = {
    fontWeight: 500,
    fontSize: '0.95rem',
    color: 'text.primary'
};

export const inputStyles = {
    borderRadius: 2,
    transition: 'all 0.3s ease',
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    '&.Mui-focused': {
        boxShadow: `0 4px 20px ${"blue"}20`,
    }
};

export const schoolData = {
    schoolName: 'ABC International School',
    schoolAddress: '123 Education Street, City - 123456',
    schoolPhone: '+91 1234567890',
    schoolEmail: 'info@school.com',
    schoolLogo: null,
    companyWebsite: 'Powered by Klopterz.com'
};

export const announcementTypes = [
    { value: 'General', label: 'General' },
    { value: 'Academic', label: 'Academic' },
    { value: 'Examination', label: 'Examination' },
    { value: 'Event', label: 'Event' },
    { value: 'Holiday', label: 'Holiday' },
    { value: 'Urgent', label: 'Urgent' },
    { value: 'Fee Related', label: 'Fee Related' },
    { value: 'SPORTS', label: 'SPORTS' }
];

export const priorities = [
    { value: 'Low', label: 'Low', color: 'default' },
    { value: 'Normal', label: 'Normal', color: 'primary' },
    { value: 'High', label: 'High', color: 'warning' },
    { value: 'Urgent', label: 'Urgent', color: 'error' }
];

export const targetAudiences = [
    { value: 'All Users', label: 'All Users' },
    { value: 'All Students', label: 'All Students' },
    { value: 'All Teachers', label: 'All Teachers' },
    { value: 'All Parents', label: 'All Parents' },
    { value: 'Specific Classes', label: 'Specific Classes' },
    { value: 'Specific Sections', label: 'Specific Sections' }
];

export const EXPENSE_CATEGORIES = [
    'Staff Salaries',
    'Electricity Bill',
    'Water Bill',
    'Functions/Events',
    'Transport/Vehicle Service',
    'Maintenance',
    'Supplies/Stationery',
    'Infrastructure',
    'Other'
];

export const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'online', label: 'Online Payment' }
];

export const MONTHS = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
];