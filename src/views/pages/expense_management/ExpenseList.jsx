import {
    Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
    Grid, IconButton, InputLabel, ListItemIcon, ListItemText, Menu, MenuItem, OutlinedInput,
    Select, Stack, Typography, Divider as MuiDivider, Tooltip, useTheme, useMediaQuery
} from '@mui/material';
import { IconEye, IconFileDownload, IconPlus, IconEdit, IconTrash, IconEyeShare } from '@tabler/icons-react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { DatePicker, Table, Popconfirm } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { EXPENSE_API_BASE_URL } from '../../../ApiConstants';
import { EXPENSE_CATEGORIES, inputStyles, labelStyles, PAYMENT_METHODS } from '../../../AppConstants';
import HeaderCard from '../../../ui-component/cards/HeaderCard';
import MainCard from '../../../ui-component/cards/MainCard';
import EduSphereLoader from '../../../ui-component/EduSphereLoader';
import customAxios from '../../../utils/axiosConfig';
import MandatoryIndicator from '../components/MandatoryIndicator';
import { toast } from 'react-toastify';

const { RangePicker } = DatePicker;

const ExpenseList = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const { loggedUser, academicYear } = useSelector(state => ({
        loggedUser: state.globalState?.loggedUser || null,
        academicYear: state.globalState?.academicYear || null
    }));
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuRowData, setMenuRowData] = useState(null);
    const [filters, setFilters] = useState({
        category: null,
        dateRange: null
    });
    const [formData, setFormData] = useState({
        id: null,
        expense_category: null,
        expense_date: null,
        amount: null,
        vendor_name: null,
        description: null,
        payment_method: null,
        receipt_attachment_url: null
    });

    const columns = [
        {
            title: 'Date',
            width: isMobile ? 90 : 110,
            dataIndex: 'expense_date',
            key: 'expense_date',
            sorter: (a, b) => new Date(a.expense_date) - new Date(b.expense_date),
            render: (date) => (
                <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                    {new Date(date).toLocaleDateString('en-IN', isMobile ? { day: '2-digit', month: 'short' } : {})}
                </Typography>
            )
        },
        {
            title: 'Category',
            dataIndex: 'expense_category',
            key: 'expense_category',
            filters: EXPENSE_CATEGORIES.map(cat => ({ text: cat, value: cat })),
            onFilter: (value, record) => record.expense_category === value,
            render: (category) => (
                <Chip
                    label={category}
                    size="small"
                    color={category === 'Staff Salaries' ? 'primary' : 'default'}
                    sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                />
            )
        },
        ...(!isMobile ? [{
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (text) => text || 'N/A'
        }] : []),
        ...(!isMobile ? [{
            title: 'Vendor/Payee',
            dataIndex: 'vendor_name',
            key: 'vendor_name',
            render: (name) => name || 'N/A'
        }] : []),
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            sorter: (a, b) => parseFloat(a.amount) - parseFloat(b.amount),
            render: (amount) => (
                <Typography
                    variant="body2"
                    fontWeight="600"
                    color="error.main"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                    ₹{parseFloat(amount).toLocaleString('en-IN', isMobile ? { maximumFractionDigits: 0 } : {})}
                </Typography>
            )
        },
        ...(!isMobile ? [{
            title: 'Payment Method',
            dataIndex: 'payment_method',
            key: 'payment_method',
            render: (method) => method ? (
                <Chip label={method.replace('_', ' ').toUpperCase()} size="small" color="primary" />
            ) : 'N/A'
        }] : []),
        ...(!isMobile ? [{
            title: 'Status',
            dataIndex: 'approval_status',
            key: 'approval_status',
            render: (status) => {
                const colorMap = {
                    'approved': 'success',
                    'pending': 'warning',
                    'rejected': 'error'
                };
                return (
                    <Chip
                        label={status?.toUpperCase() || 'N/A'}
                        size="small"
                        color={colorMap[status] || 'default'}
                    />
                );
            }
        }] : []),
        {
            title: 'Actions',
            key: 'actions',
            width: isMobile ? 50 : 80,
            fixed: isMobile ? 'right' : false,
            render: (_, record) => (
                <IconButton
                    onClick={(event) => handleMenuOpen(event, record)}
                    size={isMobile ? "small" : "medium"}
                >
                    <MoreVertIcon fontSize={isMobile ? "small" : "medium"} />
                </IconButton>
            )
        }
    ];

    useEffect(() => {
        fetchExpenses();
    }, [filters]);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            let params = `academic_year_id=${academicYear?.id}`;

            if (filters.category) {
                params += `&category=${filters.category}`;
            }

            if (filters.dateRange) {
                params += `&start_date=${filters.dateRange[0]}&end_date=${filters.dateRange[1]}`;
            }

            const response = await customAxios.get(
                `${EXPENSE_API_BASE_URL}/${loggedUser.skid}?${params}`
            );
            setExpenses(response.data.expenses);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (!formData.expense_category || !formData.expense_date || !formData.amount || !formData.payment_method) {
                toast.error('Please fill all required fields');
                return;
            }

            const payload = {
                expense_category: formData.expense_category,
                expense_date: formData.expense_date,
                amount: parseFloat(formData.amount),
                vendor_name: formData.vendor_name || null,
                description: formData.description || null,
                payment_method: formData.payment_method,
                receipt_attachment_url: formData.receipt_attachment_url || null,
                academic_year_id: academicYear?.id,
                created_by: loggedUser.school_user_id,
                approval_status: 'approved'
            };

            let response;
            if (isEditMode) {
                response = await customAxios.put(`${EXPENSE_API_BASE_URL}/update/${loggedUser.skid}/${formData.id}`, payload);
            } else {
                response = await customAxios.post(`${EXPENSE_API_BASE_URL}/create/${loggedUser.skid}`, payload);
            }
            if (response?.data?.code === 200 && response?.data?.status === 'success') {
                toast.success(response.data.message);
            }
            setOpenDialog(false);
            fetchExpenses();
            resetForm();
        } catch (error) {
            console.error('Error saving expense:', error);
            toast.error(error.response?.data?.message || 'Failed to save expense');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (record) => {
        if (record.reference_type === 'salary_payment') {
            toast.warning('Salary payment expenses cannot be deleted directly. Please cancel the payment through the Salary Payments section.');
            handleMenuClose();
            return;
        }

        setSelectedExpense(record);
        setOpenDeleteDialog(true);
        handleMenuClose();
    };

    const confirmDeleteExpense = async () => {
        setLoading(true);
        try {
            const response = await customAxios.delete(
                `${EXPENSE_API_BASE_URL}/delete/${loggedUser.skid}/${selectedExpense.id}`
            );
            if (response?.data?.code === 200 && response?.data?.status === 'success') {
                toast.success(response.data.message || "Expense deleted successfully!");
            }
            setOpenDeleteDialog(false);
            setSelectedExpense(null);
            fetchExpenses();
        } catch (error) {
            console.error('Error deleting expense:', error);
            toast.error(error.response?.data?.message || 'Failed to delete expense');
        } finally {
            setLoading(false);
        }
    };

    const handleMenuOpen = (event, record) => {
        setMenuAnchorEl(event.currentTarget);
        setMenuRowData(record);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setMenuRowData(null);
    };

    const handleEditExpense = (record) => {
        setIsEditMode(true);
        setFormData({
            id: record.id,
            expense_category: record.expense_category,
            expense_date: record.expense_date,
            amount: record.amount,
            vendor_name: record.vendor_name,
            description: record.description,
            payment_method: record.payment_method,
            receipt_attachment_url: record.receipt_attachment_url
        });
        setOpenDialog(true);
        handleMenuClose();
    };

    const handleViewExpenseDialog = (record) => {
        setSelectedExpense(record);
        setOpenViewDialog(true);
        handleMenuClose();
    };

    const resetForm = () => {
        setIsEditMode(false);
        setFormData({
            id: null,
            expense_category: null,
            expense_date: null,
            amount: null,
            vendor_name: null,
            description: null,
            payment_method: null,
            receipt_attachment_url: null
        });
    };

    const calculateTotalExpense = () => {
        return expenses.reduce((sum, expense) =>
            sum + parseFloat(expense.amount || 0), 0
        );
    };

    const getCategoryWiseExpense = () => {
        const categoryTotals = {};
        expenses.forEach(expense => {
            const category = expense.expense_category;
            categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount);
        });
        return categoryTotals;
    };

    const categoryExpenses = getCategoryWiseExpense();
    const totalExpense = calculateTotalExpense();

    const breadcrumbLinks = [
        { title: 'Dashboard', to: '/dashboard' },
        { title: 'Expense List', to: '/expense/List' },
    ];

    return (
        <Box sx={{ pl: { xs: 0, sm: 3 }, pr: { xs: 0, sm: 3 } }}>
            <EduSphereLoader loading={loading} />
            <HeaderCard
                heading={'Expense List'}
                breadcrumbLinks={breadcrumbLinks}
                buttonColor={'primary'}
                buttonvariant={'contained'}
                buttonText="Add New Expense"
                onButtonClick={() => {
                    resetForm();
                    setOpenDialog(true);
                }}
                buttonIcon={<IconPlus size={isMobile ? 16 : 20} />}
            />
            <MainCard>
                {/* Summary Cards */}
                <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{ bgcolor: '#e3f2fd' }}>
                            <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    Total Expenses
                                </Typography>
                                <Typography
                                    variant="h4"
                                    color="primary"
                                    fontWeight="600"
                                    sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem' } }}
                                >
                                    ₹{totalExpense.toLocaleString('en-IN')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                    {expenses.length} transactions
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{ bgcolor: '#fff3e0' }}>
                            <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    Salary Expenses
                                </Typography>
                                <Typography
                                    variant="h4"
                                    color="warning.main"
                                    fontWeight="600"
                                    sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem' } }}
                                >
                                    ₹{(categoryExpenses['Staff Salaries'] || 0).toLocaleString('en-IN')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={12} md={4}>
                        <Card sx={{ bgcolor: '#f3e5f5' }}>
                            <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    Other Expenses
                                </Typography>
                                <Typography
                                    variant="h4"
                                    color="secondary"
                                    fontWeight="600"
                                    sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem' } }}
                                >
                                    ₹{(totalExpense - (categoryExpenses['Staff Salaries'] || 0)).toLocaleString('en-IN')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filters and Actions */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    mb: { xs: 2, sm: 3 },
                    gap: { xs: 2, sm: 0 }
                }}>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 1, sm: 2 }}
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                        <Select
                            size="small"
                            displayEmpty
                            value={filters.category || ''}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            sx={{
                                minWidth: { xs: '100%', sm: 200 },
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            {EXPENSE_CATEGORIES.map((cat) => (
                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                            ))}
                        </Select>

                        <RangePicker
                            onChange={(dates, dateStrings) => {
                                setFilters({
                                    ...filters,
                                    dateRange: dateStrings[0] ? dateStrings : null
                                });
                            }}
                            style={{ width: isMobile ? '100%' : 'auto' }}
                            size={isMobile ? 'middle' : 'large'}
                        />
                    </Stack>

                    <Button
                        variant="outlined"
                        startIcon={<IconFileDownload size={isMobile ? 16 : 20} />}
                        size={isMobile ? "small" : "medium"}
                        fullWidth={isMobile}
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                        Export
                    </Button>
                </Box>

                {/* Expense Table */}
                <Box sx={{ overflowX: 'auto' }}>
                    <Table
                        columns={columns}
                        dataSource={expenses}
                        rowKey="id"
                        pagination={{
                            pageSize: isMobile ? 5 : 10,
                            // simple: isMobile,
                            size: isMobile ? 'small' : 'default'
                        }}
                        scroll={{ x: isMobile ? 600 : 1200 }}
                        size={isMobile ? 'small' : 'middle'}
                    />
                </Box>
            </MainCard>

            {/* Actions Menu */}
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={() => handleViewExpenseDialog(menuRowData)}>
                    <ListItemIcon><IconEyeShare size={isMobile ? 18 : 20} /></ListItemIcon>
                    <ListItemText
                        primary="View Details"
                        slotProps={{ primary: { sx: { fontSize: { xs: '0.875rem', sm: '1rem' } } } }}
                    />
                </MenuItem>
                <MuiDivider />
                <MenuItem
                    onClick={() => handleEditExpense(menuRowData)}
                    disabled={menuRowData?.reference_type === 'salary_payment'}
                >
                    <ListItemIcon><IconEdit size={isMobile ? 18 : 20} /></ListItemIcon>
                    <ListItemText
                        primaryTypographyProps={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
                    >
                        Edit Expense
                        {menuRowData?.reference_type === 'salary_payment' &&
                            <Typography variant="caption" display="block" color="text.secondary">
                                (Salary payments can't be edited here)
                            </Typography>
                        }
                    </ListItemText>
                </MenuItem>
                <MuiDivider />
                <MenuItem
                    onClick={() => handleDeleteClick(menuRowData)}
                    sx={{ color: menuRowData?.reference_type === 'salary_payment' ? 'text.disabled' : 'red' }}
                    disabled={menuRowData?.reference_type === 'salary_payment'}
                >
                    <ListItemIcon>
                        <IconTrash
                            size={isMobile ? 18 : 20}
                            color={menuRowData?.reference_type === 'salary_payment' ? 'gray' : 'red'}
                        />
                    </ListItemIcon>
                    <ListItemText
                        primaryTypographyProps={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
                    >
                        Delete Expense
                        {menuRowData?.reference_type === 'salary_payment' &&
                            <Typography variant="caption" display="block" color="text.secondary">
                                (Cancel salary payment instead)
                            </Typography>
                        }
                    </ListItemText>
                </MenuItem>
            </Menu>

            {/* Add/Edit Expense Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => { setOpenDialog(false); resetForm(); }}
                maxWidth="md"
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle sx={{ fontSize: { xs: '1.125rem', sm: '1.5rem' } }}>
                    {isEditMode ? 'Edit Expense' : 'Record New Expense'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={{ xs: 2, sm: 2 }} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="expense_category" sx={{ ...labelStyles, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    <MandatoryIndicator label="Expense Category" isRequired={true} />
                                </InputLabel>
                                <Select
                                    id="expense_category"
                                    fullWidth
                                    required
                                    size={isMobile ? "small" : "medium"}
                                    value={formData.expense_category || ''}
                                    onChange={(e) => setFormData({ ...formData, expense_category: e.target.value })}
                                    sx={{ ...inputStyles, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                >
                                    {EXPENSE_CATEGORIES.map((category) => (
                                        <MenuItem key={category} value={category}>{category}</MenuItem>
                                    ))}
                                </Select>
                            </Stack>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="expense_date" sx={{ ...labelStyles, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    <MandatoryIndicator label="Expense Date" isRequired={true} />
                                </InputLabel>
                                <OutlinedInput
                                    id="expense_date"
                                    fullWidth
                                    required
                                    size={isMobile ? "small" : "medium"}
                                    type="date"
                                    value={formData.expense_date || ''}
                                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                                    sx={{ ...inputStyles, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                />
                            </Stack>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="amount" sx={{ ...labelStyles, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    <MandatoryIndicator label="Amount" isRequired={true} />
                                </InputLabel>
                                <OutlinedInput
                                    id="amount"
                                    fullWidth
                                    required
                                    size={isMobile ? "small" : "medium"}
                                    type="number"
                                    value={formData.amount || ''}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    startAdornment={<Typography sx={{ mr: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>₹</Typography>}
                                    inputProps={{ min: 0, step: 0.01 }}
                                    sx={{ ...inputStyles, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                />
                            </Stack>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="payment_method" sx={{ ...labelStyles, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    <MandatoryIndicator label="Payment Method" isRequired={true} />
                                </InputLabel>
                                <Select
                                    id="payment_method"
                                    fullWidth
                                    required
                                    size={isMobile ? "small" : "medium"}
                                    value={formData.payment_method || ''}
                                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                    sx={{ ...inputStyles, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                >
                                    {PAYMENT_METHODS.map((method) => (
                                        <MenuItem key={method.value} value={method.value}>
                                            {method.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Stack>
                        </Grid>

                        <Grid item xs={12}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="vendor_name" sx={{ ...labelStyles, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    Vendor/Payee Name
                                </InputLabel>
                                <OutlinedInput
                                    id="vendor_name"
                                    fullWidth
                                    size={isMobile ? "small" : "medium"}
                                    value={formData.vendor_name || ''}
                                    onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                                    sx={{ ...inputStyles, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                />
                            </Stack>
                        </Grid>

                        <Grid item xs={12}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="description" sx={{ ...labelStyles, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    Description
                                </InputLabel>
                                <OutlinedInput
                                    id="description"
                                    fullWidth
                                    size={isMobile ? "small" : "medium"}
                                    multiline
                                    rows={isMobile ? 2 : 3}
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    sx={{ ...inputStyles, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                />
                            </Stack>
                        </Grid>

                        <Grid item xs={12}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="receipt_attachment_url" sx={{ ...labelStyles, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    Receipt URL (optional)
                                </InputLabel>
                                <OutlinedInput
                                    id="receipt_attachment_url"
                                    fullWidth
                                    size={isMobile ? "small" : "medium"}
                                    value={formData.receipt_attachment_url || ''}
                                    onChange={(e) => setFormData({ ...formData, receipt_attachment_url: e.target.value })}
                                    sx={{ ...inputStyles, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                    Upload receipt to cloud storage and paste URL
                                </Typography>
                            </Stack>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
                    <Button
                        onClick={() => { setOpenDialog(false); resetForm(); }}
                        size={isMobile ? "small" : "medium"}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        size={isMobile ? "small" : "medium"}
                    >
                        {isEditMode ? 'Update' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Expense Dialog */}
            <Dialog
                open={openViewDialog}
                onClose={() => setOpenViewDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontSize: { xs: '1.125rem', sm: '1.5rem' } }}>
                    Expense Details
                </DialogTitle>
                <DialogContent>
                    {selectedExpense && (
                        <Box sx={{ pt: 2 }}>
                            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                        Category
                                    </Typography>
                                    <Typography variant="body1" fontWeight="500" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                        {selectedExpense.expense_category}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                        Date
                                    </Typography>
                                    <Typography variant="body1" fontWeight="500" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                        {new Date(selectedExpense.expense_date).toLocaleDateString('en-IN')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                        Amount
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        color="error.main"
                                        sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                                    >
                                        ₹{parseFloat(selectedExpense.amount).toLocaleString('en-IN')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                        Payment Method
                                    </Typography>
                                    <Typography variant="body1" fontWeight="500" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                        {selectedExpense.payment_method?.replace('_', ' ').toUpperCase() || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                        Vendor/Payee
                                    </Typography>
                                    <Typography variant="body1" fontWeight="500" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                        {selectedExpense.vendor_name || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                        Description
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                        {selectedExpense.description || 'N/A'}
                                    </Typography>
                                </Grid>
                                {selectedExpense.receipt_attachment_url && (
                                    <Grid item xs={12}>
                                        <Button
                                            variant="outlined"
                                            size={isMobile ? "small" : "medium"}
                                            href={selectedExpense.receipt_attachment_url}
                                            target="_blank"
                                            fullWidth={isMobile}
                                        >
                                            View Receipt
                                        </Button>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
                    <Button
                        onClick={() => setOpenViewDialog(false)}
                        size={isMobile ? "small" : "medium"}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                fullScreen={isMobile}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontSize: { xs: '1.125rem', sm: '1.5rem' }
                }}>
                    <IconTrash size={isMobile ? 20 : 24} />
                    Delete Expense
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        Are you sure you want to delete this expense?
                    </Typography>
                    {selectedExpense && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                <strong>Category:</strong> {selectedExpense.expense_category}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                <strong>Amount:</strong> ₹{parseFloat(selectedExpense.amount).toLocaleString('en-IN')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                <strong>Date:</strong> {new Date(selectedExpense.expense_date).toLocaleDateString('en-IN')}
                            </Typography>
                            {selectedExpense.vendor_name && (
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    <strong>Vendor:</strong> {selectedExpense.vendor_name}
                                </Typography>
                            )}
                        </Box>
                    )}
                    <Typography sx={{ mt: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }} color="error">
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
                    <Button
                        onClick={() => setOpenDeleteDialog(false)}
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                        fullWidth={isMobile}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDeleteExpense}
                        variant="contained"
                        color="error"
                        size={isMobile ? "small" : "medium"}
                        fullWidth={isMobile}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ExpenseList;
