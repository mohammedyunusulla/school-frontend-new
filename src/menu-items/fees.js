// assets
import { IconKey, IconTransactionRupee, IconReceiptRupee } from '@tabler/icons-react';

// constant
const icons = {
    IconKey, IconTransactionRupee, IconReceiptRupee
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const fees = {
    id: 'fee management',
    title: '',
    caption: '',
    icon: icons.IconKey,
    type: 'group',
    children: [
        {
            id: 'fee-management',
            title: 'Fee Management',
            type: 'collapse',
            icon: icons.IconReceiptRupee,
            breadcrumbs: false,
            roles: ['SCHOOL_ADMIN'],
            children: [
                {
                    id: 'fee-structures',
                    title: 'Fee Structures',
                    type: 'item',
                    url: '/fee/structures',
                    // icon: icons.IconTransactionRupee,
                    breadcrumbs: false,
                    roles: ['SCHOOL_ADMIN'],
                },
                {
                    id: 'fee-collection',
                    title: 'Fee Collection',
                    type: 'item',
                    url: '/fee/collection',
                    // icon: icons.IconReceiptRupee,
                    breadcrumbs: false,
                    roles: ['SCHOOL_ADMIN'],
                },
                // {
                //     id: 'fee-reports',
                //     title: 'Fee Reports',
                //     type: 'item',
                //     url: '/fee/reports',
                //     // icon: icons.IconPlus,
                //     breadcrumbs: false,
                //     roles: ['SCHOOL_ADMIN'],
                // },
            ]
        },
        {
            id: 'expense-management',
            title: 'Expense Management',
            type: 'collapse',
            icon: icons.IconTransactionRupee,
            breadcrumbs: false,
            roles: ['SCHOOL_ADMIN'],
            children: [
                {
                    id: 'expense-list',
                    title: 'Expense List',
                    type: 'item',
                    url: '/expense/List',
                    // icon: icons.IconTransactionRupee,
                    breadcrumbs: false,
                    roles: ['SCHOOL_ADMIN'],
                },
                {
                    id: 'Salary-payment-generation',
                    title: 'Salary Payment generation',
                    type: 'item',
                    url: '/expense/Salary-payment-generation',
                    // icon: icons.IconPlus,
                    breadcrumbs: false,
                    roles: ['SCHOOL_ADMIN'],
                },
                {
                    id: 'salary-setup',
                    title: 'Salary Setup',
                    type: 'item',
                    url: '/salary-setup',
                    // icon: icons.IconReceiptRupee,
                    breadcrumbs: false,
                    roles: ['SCHOOL_ADMIN'],
                },
            ]
        },
    ]
};

export default fees;
