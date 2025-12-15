import React, { useEffect, useState } from 'react';
import { Table, Tag } from 'antd';
import { useSelector } from 'react-redux';
import customAxios from '../../../utils/axiosConfig';
import { EXPENSE_API_BASE_URL } from '../../../ApiConstants';
import {
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Grid, MenuItem, Box, Typography, Card, CardContent,
    Alert, Stack, Chip, useTheme, useMediaQuery
} from '@mui/material';
import { IconCurrencyRupee, IconCheck, IconFileDownload } from '@tabler/icons-react';
import EduSphereLoader from '../../../ui-component/EduSphereLoader';
import { PAYMENT_METHODS } from '../../../AppConstants';
import { toast } from 'react-toastify';

const SalaryPaymentGeneration = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const { loggedUser, academicYear } = useSelector(state => ({
        loggedUser: state.globalState?.loggedUser || null,
        academicYear: state.globalState?.academicYear || null
    }));

    const [salaryPayments, setSalaryPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [paymentData, setPaymentData] = useState({
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: null,
        transaction_reference: null
    });
    const [generationForm, setGenerationForm] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const columns = [
        {
            title: 'Staff Name',
            dataIndex: 'staff_name',
            key: 'staff_name',
            sorter: (a, b) => a.staff_name.localeCompare(b.staff_name),
            width: isMobile ? 80 : 180,
            fixed: isMobile ? 'left' : false,
            render: (name) => (
                <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {name}
                </Typography>
            )
        },
        {
            title: 'Month/Year',
            key: 'payment_period',
            width: isMobile ? 80 : 120,
            render: (_, record) => (
                <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                    {record.payment_month}/{record.payment_year}
                </Typography>
            )
        },
        ...(!isMobile ? [{
            title: 'Basic Salary',
            dataIndex: 'basic_salary',
            key: 'basic_salary',
            render: (amount) => `₹${parseFloat(amount).toLocaleString('en-IN')}`
        }] : []),
        ...(!isMobile ? [{
            title: 'Allowances',
            dataIndex: 'allowances_paid',
            key: 'allowances_paid',
            render: (allowances) => {
                const total = Object.values(allowances || {}).reduce((sum, val) => sum + parseFloat(val || 0), 0);
                return `₹${total.toLocaleString('en-IN')}`;
            }
        }] : []),
        ...(!isMobile ? [{
            title: 'Deductions',
            dataIndex: 'deductions_applied',
            key: 'deductions_applied',
            render: (deductions) => {
                const total = Object.values(deductions || {}).reduce((sum, val) => sum + parseFloat(val || 0), 0);
                return (
                    <Typography variant="body2" color="error.main">
                        -₹{total.toLocaleString('en-IN')}
                    </Typography>
                );
            }
        }] : []),
        {
            title: 'Net Salary',
            dataIndex: 'net_amount_paid',
            key: 'net_amount_paid',
            width: isMobile ? 90 : 120,
            render: (amount) => (
                <Typography
                    variant="body2"
                    fontWeight="600"
                    color="success.main"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                    ₹{parseFloat(amount).toLocaleString('en-IN', isMobile ? { maximumFractionDigits: 0 } : {})}
                </Typography>
            )
        },
        ...(!isMobile ? [{
            title: 'Payment Date',
            dataIndex: 'payment_date',
            key: 'payment_date',
            render: (date) => date ? new Date(date).toLocaleDateString('en-IN') : 'Not Paid'
        }] : []),
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: isMobile ? 70 : 100,
            render: (status) => {
                const colorMap = {
                    'paid': 'success',
                    'pending': 'warning',
                    'cancelled': 'error'
                };
                return (
                    <Chip
                        label={status?.toUpperCase()}
                        size="small"
                        color={colorMap[status] || 'default'}
                        sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                    />
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            width: isMobile ? 80 : 140,
            // fixed: isMobile ? 'right' : false,
            render: (_, record) => (
                <Stack direction="column" spacing={0.5}>
                    {record.status === 'pending' && (
                        <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={!isMobile && <IconCheck size={16} />}
                            onClick={() => handleOpenPaymentDialog(record)}
                            sx={{
                                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                padding: { xs: '4px 8px', sm: '6px 16px' }
                            }}
                        >
                            {isMobile ? 'Pay' : 'Mark Paid'}
                        </Button>
                    )}
                    {record.status === 'paid' && (
                        <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={!isMobile && <IconCheck size={16} />}
                            onClick={() => handleMarkUnpaid(record)}
                            sx={{
                                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                padding: { xs: '4px 8px', sm: '6px 16px' }
                            }}
                        >
                            {isMobile ? 'Unpay' : 'Mark as Un-Paid'}
                        </Button>
                    )}
                </Stack>
            )
        }
    ];

    const months = [
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

    useEffect(() => {
        fetchSalaryPayments();
    }, []);

    const fetchSalaryPayments = async () => {
        setLoading(true);
        try {
            const response = await customAxios.get(
                `${EXPENSE_API_BASE_URL}/salary-payments/${loggedUser.skid}?academic_year_id=${academicYear?.id}`
            );
            setSalaryPayments(response.data.salary_payments || []);
        } catch (error) {
            console.error('Error fetching salary payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateSalaries = async () => {
        setLoading(true);
        setGenerating(true);
        try {
            const response = await customAxios.post(
                `${EXPENSE_API_BASE_URL}/salary-payments/generate/${loggedUser.skid}`,
                {
                    academic_year_id: academicYear?.id,
                    month: generationForm.month,
                    year: generationForm.year
                }
            );

            if (response.data.salary_payments.length > 0) {
                toast.success(`Generated ${response.data.salary_payments.length} salary payments successfully!`);
                fetchSalaryPayments();
            } else {
                toast.info('No new salary payments generated. They may already exist for this period.');
            }
        } catch (error) {
            console.error('Error generating salaries:', error);
            toast.error('Failed to generate salaries. Please try again.');
        } finally {
            setLoading(false);
            setGenerating(false);
        }
    };

    const handleOpenPaymentDialog = (payment) => {
        setSelectedPayment(payment);
        setOpenPaymentDialog(true);
    };

    const handleMarkPaid = async () => {
        setLoading(true);
        try {
            const response = await customAxios.put(
                `${EXPENSE_API_BASE_URL}/salary-payments/${selectedPayment.id}/mark-paid/${loggedUser.skid}`,
                {
                    ...paymentData,
                    paid_by: loggedUser.school_user_id
                }
            );
            if (response?.data?.code === 200 && response?.data?.status === 'success') {
                toast.success(response.data.message || 'Salary marked as paid successfully!');
            }
            setOpenPaymentDialog(false);
            fetchSalaryPayments();
            resetPaymentData();
        } catch (error) {
            console.error('Error marking salary as paid:', error);
            toast.error('Failed to mark salary as paid. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkUnpaid = async (record) => {
        setLoading(true);
        try {
            const response = await customAxios.put(
                `${EXPENSE_API_BASE_URL}/salary-payments/${loggedUser.skid}/mark-unpaid/${record.id}`
            );
            if (response?.data?.code === 200 && response?.data?.status === 'success') {
                toast.success(response.data.message);
            }
            fetchSalaryPayments();
            resetPaymentData();
        } catch (error) {
            console.error('Error marking salary as unpaid:', error);
            toast.error('Failed to mark salary as unpaid. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetPaymentData = () => {
        setPaymentData({
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: null,
            transaction_reference: null
        });
        setSelectedPayment(null);
    };

    const getTotalsByStatus = () => {
        const totals = {
            paid: 0,
            pending: 0,
            totalAmount: 0
        };

        salaryPayments.forEach(payment => {
            const amount = parseFloat(payment.net_amount_paid);
            totals.totalAmount += amount;

            if (payment.status === 'paid') {
                totals.paid += amount;
            } else if (payment.status === 'pending') {
                totals.pending += amount;
            }
        });

        return totals;
    };

    const totals = getTotalsByStatus();

    return (
        <Box sx={{ p: { xs: 0, sm: 1, md: 3 } }}>
            <EduSphereLoader loading={loading} />
            <Typography
                variant="h4"
                sx={{
                    mb: { xs: 2, sm: 3 },
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                    px: { xs: 2, sm: 0 }
                }}
            >
                Salary Payment Management
            </Typography>

            {/* Generation Section */}
            <Card sx={{ mb: { xs: 2, sm: 3 }, bgcolor: '#f5f5f5' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
                    <Typography
                        variant="h6"
                        sx={{
                            mb: 2,
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                    >
                        Generate Monthly Salaries
                    </Typography>
                    <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                select
                                fullWidth
                                size={isMobile ? "small" : "medium"}
                                label="Month"
                                value={generationForm.month}
                                onChange={(e) => setGenerationForm({ ...generationForm, month: e.target.value })}
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                            >
                                {months.map((month) => (
                                    <MenuItem key={month.value} value={month.value}>
                                        {month.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                type="number"
                                fullWidth
                                size={isMobile ? "small" : "medium"}
                                label="Year"
                                value={generationForm.year}
                                onChange={(e) => setGenerationForm({ ...generationForm, year: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6}>
                            <Button
                                variant="contained"
                                fullWidth
                                size={isMobile ? "medium" : "large"}
                                startIcon={<IconCurrencyRupee size={isMobile ? 18 : 20} />}
                                onClick={handleGenerateSalaries}
                                disabled={generating}
                                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                            >
                                {generating ? 'Generating...' : 'Generate Salaries'}
                            </Button>
                        </Grid>
                    </Grid>
                    <Alert
                        severity="info"
                        sx={{
                            mt: 2,
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                    >
                        This will generate salary payment records for all staff with active salary setups for the selected month/year.
                    </Alert>
                </CardContent>
            </Card>



            {/* Payments Table */}
            <Card>
                <CardContent sx={{ p: { xs: 1, sm: 2, md: 3 }, '&:last-child': { pb: { xs: 1, sm: 2, md: 3 } } }}>
                    {/* Summary Cards */}
                    <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card sx={{ bgcolor: '#e8f5e9' }}>
                                <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                    >
                                        Paid Salaries
                                    </Typography>
                                    <Typography
                                        variant="h4"
                                        color="success.main"
                                        fontWeight="600"
                                        sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2rem' } }}
                                    >
                                        ₹{totals.paid.toLocaleString('en-IN')}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                    >
                                        {salaryPayments.filter(p => p.status === 'paid').length} payments
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card sx={{ bgcolor: '#fff3e0' }}>
                                <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                    >
                                        Pending Salaries
                                    </Typography>
                                    <Typography
                                        variant="h4"
                                        color="warning.main"
                                        fontWeight="600"
                                        sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2rem' } }}
                                    >
                                        ₹{totals.pending.toLocaleString('en-IN')}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                    >
                                        {salaryPayments.filter(p => p.status === 'pending').length} payments
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={12} md={4}>
                            <Card sx={{ bgcolor: '#e3f2fd' }}>
                                <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                    >
                                        Total Salary Amount
                                    </Typography>
                                    <Typography
                                        variant="h4"
                                        color="primary"
                                        fontWeight="600"
                                        sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2rem' } }}
                                    >
                                        ₹{totals.totalAmount.toLocaleString('en-IN')}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                    >
                                        {salaryPayments.length} total payments
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        mb: 2,
                        gap: { xs: 1, sm: 0 }
                    }}>
                        <Typography
                            variant="h6"
                            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                        >
                            Salary Payments
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<IconFileDownload size={isMobile ? 16 : 20} />}
                            size={isMobile ? "small" : "medium"}
                            fullWidth={isMobile}
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                            Export Report
                        </Button>
                    </Box>
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table
                            columns={columns}
                            dataSource={salaryPayments}
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
                </CardContent>
            </Card>

            {/* Mark as Paid Dialog */}
            <Dialog
                open={openPaymentDialog}
                onClose={() => setOpenPaymentDialog(false)}
                maxWidth="sm"
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle sx={{ fontSize: { xs: '1.125rem', sm: '1.5rem' } }}>
                    Mark Salary as Paid
                </DialogTitle>
                <DialogContent>
                    {selectedPayment && (
                        <Box sx={{ pt: 2 }}>
                            <Alert
                                severity="info"
                                sx={{
                                    mb: 3,
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    fontWeight="600"
                                    sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                                >
                                    Staff: {selectedPayment.staff_name}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                >
                                    Amount: ₹{parseFloat(selectedPayment.net_amount_paid).toLocaleString('en-IN')}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                >
                                    Period: {selectedPayment.payment_month}/{selectedPayment.payment_year}
                                </Typography>
                            </Alert>

                            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        required
                                        size={isMobile ? "small" : "medium"}
                                        type="date"
                                        label="Payment Date"
                                        InputLabelProps={{ shrink: true }}
                                        value={paymentData.payment_date}
                                        onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        select
                                        fullWidth
                                        required
                                        size={isMobile ? "small" : "medium"}
                                        label="Payment Method"
                                        value={paymentData.payment_method}
                                        onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                                    >
                                        {PAYMENT_METHODS.map((method) => (
                                            <MenuItem key={method.value} value={method.value}>
                                                {method.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        size={isMobile ? "small" : "medium"}
                                        label="Transaction Reference (optional)"
                                        value={paymentData.transaction_reference}
                                        onChange={(e) => setPaymentData({ ...paymentData, transaction_reference: e.target.value })}
                                        helperText="Enter transaction ID, cheque number, or reference"
                                        FormHelperTextProps={{
                                            sx: { fontSize: { xs: '0.65rem', sm: '0.75rem' } }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: { xs: 2, sm: 3 }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
                    <Button
                        onClick={() => setOpenPaymentDialog(false)}
                        size={isMobile ? "small" : "medium"}
                        fullWidth={isMobile}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleMarkPaid}
                        disabled={!paymentData.payment_method}
                        size={isMobile ? "small" : "medium"}
                        fullWidth={isMobile}
                    >
                        Confirm Payment
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SalaryPaymentGeneration;
