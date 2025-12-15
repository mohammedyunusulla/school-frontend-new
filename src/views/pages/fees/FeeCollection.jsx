// components/fees/FeeCollection.jsx - Enhanced with Recurring Payment Support

import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    List,
    ListItemButton,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import {
    IconCalendar,
    IconCurrencyRupee,
    IconDownload,
    IconPhone,
    IconPrinter,
    IconRefresh,
    IconSearch
} from '@tabler/icons-react';
import { Table, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FEES_API_BASE_URL } from '../../../ApiConstants';
import { schoolData } from '../../../AppConstants';
import MainCard from '../../../ui-component/cards/MainCard';
import EduSphereLoader from '../../../ui-component/EduSphereLoader';
import customAxios from '../../../utils/axiosConfig';
import InstallmentDialog from './InstallmentDialog';


const FeeCollection = () => {
    const { loggedUser, academicYear } = useSelector(state => ({
        loggedUser: state.globalState?.loggedUser || null,
        academicYear: state.globalState?.academicYear || null
    }));
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [feeSummary, setFeeSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
    const [openInstallmentDialog, setOpenInstallmentDialog] = useState(false);
    const [selectedFee, setSelectedFee] = useState(null);
    const [selectedInstallment, setSelectedInstallment] = useState(null);
    const [feeInstallments, setFeeInstallments] = useState({});
    const [paymentData, setPaymentData] = useState({
        amount_paid: '',
        payment_mode: 'CASH',
        payment_date: dayjs().format('YYYY-MM-DD'),
        transaction_id: '',
        cheque_number: '',
        bank_name: '',
        remarks: ''
    });

    const paymentModes = ['CASH', 'CHEQUE', 'ONLINE', 'UPI', 'CARD', 'DEMAND_DRAFT'];

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            toast.error('Please enter student name, phone, or roll number');
            return;
        }

        try {
            setLoading(true);
            const response = await customAxios.get(
                `${FEES_API_BASE_URL}/search-student/${loggedUser?.skid}`,
                { params: { q: searchQuery, academic_year_id: academicYear?.id } }
            );

            if (response.data.code === 200) {
                const results = response.data.data;
                if (results.length === 0) {
                    toast.error('No student found');
                    setSearchResults([]);
                } else if (results.length === 1) {
                    selectStudent(results[0]);
                } else {
                    setSearchResults(results);
                    setFeeSummary(null);
                }
            }
        } catch (error) {
            console.error('Error searching student:', error);
            toast.error('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const selectStudent = async (student) => {
        setSelectedStudent(student);
        setSearchResults([]);
        await fetchFeeSummary(student.user_id);
    };

    const fetchFeeSummary = async (userId) => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                `${FEES_API_BASE_URL}/summary/student/${loggedUser?.skid}/${userId}`,
                { params: { academic_year_id: academicYear?.id } }
            );

            if (response.data.code === 200) {
                setFeeSummary(response.data.data);

                // Fetch installments for each fee
                const installmentsData = {};
                for (const fee of response.data.data.fees) {
                    if (fee.has_installments) {
                        try {
                            const instResponse = await customAxios.get(
                                `${FEES_API_BASE_URL}/installments/get/${loggedUser?.skid}/${fee.id}`
                            );
                            if (instResponse.data.code === 200) {
                                installmentsData[fee.id] = instResponse.data.data;
                            }
                        } catch (error) {
                            console.error('Error fetching installments:', error);
                        }
                    }
                }
                setFeeInstallments(installmentsData);
            }
        } catch (error) {
            console.error('Error fetching fee summary:', error);
            toast.error('Failed to fetch fee details');
        } finally {
            setLoading(false);
        }
    };

    // // NEW: Generate recurring installments automatically
    // const handleGenerateRecurringInstallments = async (fee) => {
    //     if (!fee.fee_structure?.is_recurring) {
    //         toast.error('This is not a recurring fee');
    //         return;
    //     }

    //     try {
    //         setLoading(true);
    //         const response = await customAxios.post(
    //             `${FEES_API_BASE_URL}/installments/auto-generate-recurring`,
    //             { student_fee_id: fee.id, skid: loggedUser?.skid }
    //         );

    //         if (response.data.code === 200) {
    //             toast.success(response.data.message);
    //             fetchFeeSummary(selectedStudent.user_id);
    //         }
    //     } catch (error) {
    //         console.error('Error generating installments:', error);
    //         toast.error(error.response?.data?.message || 'Failed to generate installments');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // NEW: Convert remaining installments to full payment
    const handleConvertToFullPayment = async (fee) => {
        if (!window.confirm(
            'This will cancel all remaining installments and allow full payment of the remaining balance. Continue?'
        )) {
            return;
        }

        try {
            setLoading(true);
            const response = await customAxios.post(
                `${FEES_API_BASE_URL}/payment/convert-to-full/${loggedUser?.skid}/${fee.id}`
            );

            if (response.data.code === 200) {
                toast.success(response.data.message);
                toast.info(`Remaining balance: ₹${response.data.data.remaining_balance.toLocaleString()}`);
                fetchFeeSummary(selectedStudent.user_id);
            }
        } catch (error) {
            console.error('Error converting to full payment:', error);
            toast.error(error.response?.data?.message || 'Failed to convert');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateInstallments = (fee) => {
        setSelectedFee(fee);
        setOpenInstallmentDialog(true);
    };

    const handlePayment = (fee, installment = null) => {
        setSelectedFee(fee);
        setSelectedInstallment(installment);
        const amount = installment ? installment.balance_amount : fee.balance_amount;
        setPaymentData(prev => ({
            ...prev,
            amount_paid: amount
        }));
        setOpenPaymentDialog(true);
    };

    const submitPayment = async () => {
        try {
            setLoading(true);
            let response;

            if (selectedInstallment) {
                // Pay installment
                response = await customAxios.post(
                    `${FEES_API_BASE_URL}/installments/payment/${loggedUser?.skid}/${selectedInstallment.id}`,
                    paymentData
                );
            } else {
                // Pay full fee
                response = await customAxios.post(
                    `${FEES_API_BASE_URL}/payment/record/${loggedUser?.skid}`,
                    {
                        student_fee_id: selectedFee.id,
                        ...paymentData
                    }
                );
            }

            if (response.data.code === 200) {
                toast.success(`Payment recorded! Receipt: ${response.data.receipt_number}`);
                setOpenPaymentDialog(false);
                fetchFeeSummary(selectedStudent.user_id);
                resetPaymentForm();
            }
        } catch (error) {
            console.error('Error recording payment:', error);
            toast.error(error.response?.data?.message || 'Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    const resetPaymentForm = () => {
        setPaymentData({
            amount_paid: '',
            payment_mode: 'CASH',
            payment_date: dayjs().format('YYYY-MM-DD'),
            transaction_id: '',
            cheque_number: '',
            bank_name: '',
            remarks: ''
        });
        setSelectedInstallment(null);
    };

    const resetSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSelectedStudent(null);
        setFeeSummary(null);
        setFeeInstallments({});
    };

    const handlePrintInstallmentReceipt = async (installment, fee) => {
        console.log(installment, fee, selectedStudent)
        try {
            setLoading(true);
            // ✅ Lazy load the receipt generator module
            const { generateFeeReceipt, printPDF } = await import('../../../prints/receiptGenerator');
            const paymentData = {
                receipt_number: installment.receipt_number || `RCP-${installment.id}`,
                amount_paid: installment.paid_amount,
                payment_date: installment.updated_at || new Date().toISOString().split('T')[0],
                payment_mode: 'N/A',
                installment_id: installment.id,
                installment_name: installment.installment_name,
                remarks: `Installment Payment - ${installment.installment_name}`,
                collected_by: loggedUser?.name || 'System'
            };
            console.log(paymentData)
            const docDef = await generateFeeReceipt(paymentData, selectedStudent, schoolData, fee);
            await printPDF(docDef);
        } catch (error) {
            console.error('Error printing receipt:', error);
            toast.error('Failed to print receipt');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInstallmentReceipt = async (installment, fee) => {
        try {
            setLoading(true);
            // ✅ Lazy load the receipt generator module
            const { generateFeeReceipt, downloadPDF } = await import('../../../prints/receiptGenerator');
            const paymentData = {
                receipt_number: installment.receipt_number || `RCP-${installment.id}`,
                amount_paid: installment.paid_amount,
                payment_date: installment.updated_at || new Date().toISOString().split('T')[0],
                payment_mode: 'N/A',
                installment_id: installment.id,
                installment_name: installment.installment_name,
                remarks: `Installment Payment - ${installment.installment_name}`,
                collected_by: loggedUser?.name || 'System'
            };

            const docDef = await generateFeeReceipt(paymentData, selectedStudent, schoolData, fee);
            await downloadPDF(docDef, `Receipt-${installment.receipt_number}.pdf`);
        } catch (error) {
            console.error('Error downloading receipt:', error);
            toast.error('Failed to download receipt');
        } finally {
            setLoading(false);
        }
    };

    const handlePrintInstallmentSummary = async (fee) => {
        try {
            setLoading(true);
            // ✅ Lazy load the receipt generator module
            const { generateInstallmentSummary, printPDF } = await import('../../../prints/receiptGenerator');
            const installments = feeInstallments[fee.id] || [];
            const docDef = await generateInstallmentSummary(fee, installments, selectedStudent, schoolData, loggedUser?.name);
            await printPDF(docDef);
        } catch (error) {
            console.error('Error printing summary:', error);
            toast.error('Failed to print summary');
        } finally {
            setLoading(false);
        }
    };

    // Installment Table Columns
    const installmentColumns = [
        {
            title: 'Installment',
            dataIndex: 'installment_name',
            key: 'name',
            render: (text, record) => (
                <Box>
                    <Typography variant="body2" fontWeight="bold">{text}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        #{record.installment_number}
                    </Typography>
                </Box>
            ),
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            render: (amount) => `₹${parseFloat(amount).toLocaleString()}`
        },
        {
            title: 'Paid',
            dataIndex: 'paid_amount',
            key: 'paid',
            align: 'right',
            render: (amount) => (
                <Typography variant="body2" color="success.main" fontWeight="bold">
                    ₹{parseFloat(amount).toLocaleString()}
                </Typography>
            )
        },
        {
            title: 'Balance',
            dataIndex: 'balance_amount',
            key: 'balance',
            align: 'right',
            render: (amount) => (
                <Typography variant="body2" color="error.main" fontWeight="bold">
                    ₹{parseFloat(amount).toLocaleString()}
                </Typography>
            )
        },
        {
            title: 'Due Date',
            dataIndex: 'due_date',
            key: 'due_date',
            render: (date) => dayjs(date).format('MMM DD, YYYY')
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status) => {
                const colorMap = {
                    'PAID': 'success',
                    'PARTIAL': 'warning',
                    'PENDING': 'error',
                    'CANCELLED': 'default'
                };
                return <Tag color={colorMap[status]}>{status}</Tag>;
            }
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Stack direction="row" spacing={0.5} justifyContent="center">
                    {record.balance_amount > 0 && record.status !== 'CANCELLED' ? (
                        <Button
                            size="small"
                            variant="contained"
                            onClick={() => handlePayment(selectedFee, record)}
                        >
                            Pay
                        </Button>
                    ) : (
                        <Chip label={record.status === 'CANCELLED' ? 'Cancelled' : 'Paid'} size="small" />
                    )}
                    {/* Print receipt for paid installments */}
                    {record.paid_amount > 0 && (
                        <Tooltip title="Print Receipt">
                            <IconButton
                                variant='contained'
                                size="small"
                                color="info"
                                onClick={() => handlePrintInstallmentReceipt(record, selectedFee)}
                            >
                                <IconPrinter size={16} />
                            </IconButton>
                        </Tooltip>
                    )}

                    {/* Download receipt for paid installments */}
                    {record.paid_amount > 0 && (
                        <Tooltip title="Download Receipt">
                            <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleDownloadInstallmentReceipt(record, selectedFee)}
                            >
                                <IconDownload size={16} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            )
        }
    ];

    // Main Fee Table Columns - ENHANCED
    const feeColumns = [
        {
            title: 'Fee Details',
            dataIndex: 'fee_structure',
            key: 'fee_name',
            width: 250,
            render: (fee_structure, record) => (
                <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" fontWeight="bold">
                            {fee_structure?.fee_name}
                        </Typography>
                        {/* NEW: Recurring indicator */}
                        {fee_structure?.is_recurring && (
                            <Tooltip title={`Recurring: ${fee_structure.recurrence_type}`}>
                                <Chip
                                    label={fee_structure.recurrence_type}
                                    size="small"
                                    color="info"
                                    icon={<IconRefresh size={14} />}
                                />
                            </Tooltip>
                        )}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                        {fee_structure?.description || 'No description'}
                    </Typography>
                    {record.has_installments && (
                        <Chip
                            label="Installment Mode"
                            size="small"
                            color="warning"
                            sx={{ mt: 0.5 }}
                        />
                    )}
                    {/* NEW: Show recurrence details */}
                    {fee_structure?.is_recurring && (
                        <Typography variant="caption" display="block" color="primary">
                            ₹{fee_structure.recurrence_amount?.toLocaleString()} × {fee_structure.recurrence_months} periods
                        </Typography>
                    )}
                </Box>
            ),
        },
        {
            title: 'Total',
            dataIndex: 'total_amount',
            key: 'total_amount',
            align: 'right',
            width: 120,
            render: (amount) => `₹${parseFloat(amount).toLocaleString()}`
        },
        {
            title: 'Paid',
            dataIndex: 'paid_amount',
            key: 'paid_amount',
            align: 'right',
            width: 120,
            render: (amount) => (
                <Typography variant="body2" color="success.main" fontWeight="bold">
                    ₹{parseFloat(amount).toLocaleString()}
                </Typography>
            )
        },
        {
            title: 'Balance',
            dataIndex: 'balance_amount',
            key: 'balance_amount',
            align: 'right',
            width: 120,
            render: (amount) => (
                <Typography variant="body2" color="error.main" fontWeight="bold">
                    ₹{parseFloat(amount).toLocaleString()}
                </Typography>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 130,
            render: (status) => {
                const colorMap = {
                    'PAID': 'success',
                    'PARTIAL': 'warning',
                    'PENDING': 'error',
                    'OVERDUE': 'error'
                };
                return <Tag color={colorMap[status]}>{status}</Tag>;
            }
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: 300,
            // fixed: 'right',
            render: (_, record) => (
                <Stack direction="row" spacing={1} justifyContent="center">
                    {/* NEW: Auto-generate recurring installments */}
                    {record.fee_structure?.is_recurring &&
                        !record.has_installments &&
                        record.balance_amount > 0 &&
                        record.fee_structure?.allows_installments && (
                            <>
                                {/* <Button
                                    size="small"
                                    variant="outlined"
                                    color="info"
                                    onClick={() => handleGenerateRecurringInstallments(record)}
                                    startIcon={<IconCalendarTime size={16} />}
                                >
                                    Generate Auto Installments
                                </Button> */}

                                {/* Manual installments for non-recurring or custom */}
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleCreateInstallments(record)}
                                    startIcon={<IconCalendar size={16} />}
                                >
                                    Setup Manual Installments
                                </Button>
                            </>
                        )}

                    {/* NEW: Convert to full payment option */}
                    {record.has_installments && record.balance_amount > 0 && (
                        <Button
                            size="small"
                            variant="contained"
                            color="warning"
                            onClick={() => handleConvertToFullPayment(record)}
                            startIcon={<IconCurrencyRupee size={16} />}
                        >
                            Pay Full Balance
                        </Button>
                    )}

                    {/* Pay full (for non-installment fees or after conversion) */}
                    {!record.has_installments && record.balance_amount > 0 && (
                        <Button
                            size="small"
                            variant="contained"
                            color='success'
                            onClick={() => handlePayment(record)}
                            startIcon={<IconCurrencyRupee size={16} />}
                        >
                            Pay Now
                        </Button>
                    )}

                    {record.balance_amount === 0 && (
                        <Chip label="Fully Paid" color="success" size="small" />
                    )}
                    {/* {record.balance_amount === 0 && (
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<IconPrinter size={16} />}
                            onClick={() => handlePrintInstallmentSummary(record)}
                        >
                            Print Summary
                        </Button>
                    )} */}
                </Stack>
            )
        }
    ];

    // Expandable row render for installments
    const expandedRowRender = (record) => {
        const installments = feeInstallments[record.id];
        if (!installments || installments.length === 0) {
            return null;
        }


        return (
            <Box p={2} bgcolor="grey.50">
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle2">
                        Installment Schedule
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<IconPrinter size={16} />}
                            onClick={() => handlePrintInstallmentSummary(record)}
                        >
                            Print Summary
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<IconDownload size={16} />}
                            onClick={async () => {
                                const { generateInstallmentSummary, downloadPDF } = await import('../../../prints/receiptGenerator');
                                const docDef = await generateInstallmentSummary(record, installments, selectedStudent, schoolData, loggedUser?.name);
                                await downloadPDF(docDef, `Installment-Summary-${record.fee_structure?.fee_name}.pdf`);
                            }}
                        >
                            Download Summary
                        </Button>
                    </Stack>
                </Stack>
                <Table
                    dataSource={installments}
                    columns={installmentColumns}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    scroll={{ x: 680, y: 400 }}
                />
            </Box>
        );
    };

    return (
        <>
            {loading && <EduSphereLoader />}

            <MainCard title="Fee Collection">
                {/* Search Section */}
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Search Student
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            fullWidth
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Name / Phone / Roll Number"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconSearch />
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleSearch}
                            startIcon={<IconSearch />}
                        >
                            Search
                        </Button>
                        {(searchResults.length > 0 || selectedStudent) && (
                            <Button variant="outlined" onClick={resetSearch}>
                                Clear
                            </Button>
                        )}
                    </Stack>
                </Paper>

                {/* Student Details & Fee Summary */}
                {feeSummary && selectedStudent && (
                    <Box>
                        {/* Student Banner */}
                        <Card sx={{ mb: 3, bgcolor: 'primary.lighter' }}>
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
                                        {selectedStudent.name?.charAt(0)?.toUpperCase()}
                                    </Avatar>
                                    <Box flex={1}>
                                        <Typography variant="h5">{selectedStudent.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Roll No: {selectedStudent.roll_no} | {selectedStudent.class} - {selectedStudent.section}
                                        </Typography>
                                        <Typography variant="body2">
                                            <IconPhone size={14} /> {selectedStudent.phone}
                                        </Typography>
                                    </Box>
                                    <Chip label={academicYear?.year_name} color="primary" />
                                </Stack>
                            </CardContent>
                        </Card>

                        {/* Summary Cards */}
                        <Grid container spacing={2} mb={3}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Total Amount
                                        </Typography>
                                        <Typography variant="h4" color="primary">
                                            ₹{feeSummary.total_amount?.toLocaleString()}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Paid Amount
                                        </Typography>
                                        <Typography variant="h4" color="success.main">
                                            ₹{feeSummary.total_paid?.toLocaleString()}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Discount
                                        </Typography>
                                        <Typography variant="h4" color="info.main">
                                            ₹{feeSummary.total_discount?.toLocaleString()}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Balance Due
                                        </Typography>
                                        <Typography variant="h4" color="error.main">
                                            ₹{feeSummary.balance?.toLocaleString()}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Fee Breakdown Table with Expandable Installments */}
                        <Paper elevation={2} sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Fee Breakdown
                            </Typography>
                            {feeSummary.fees?.length === 0 ? (
                                <Alert severity="info">
                                    No fees assigned to this student for {academicYear?.year_name}
                                </Alert>
                            ) : (
                                <Table
                                    dataSource={feeSummary.fees}
                                    columns={feeColumns}
                                    rowKey="id"
                                    pagination={false}
                                    scroll={{ x: 1400 }}
                                    expandable={{
                                        expandedRowRender,
                                        rowExpandable: (record) =>
                                            record.has_installments && feeInstallments[record.id]?.length > 0
                                    }}
                                />
                            )}
                        </Paper>
                    </Box>
                )}

                {/* Search Results */}
                {searchResults.length > 1 && (
                    <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            {searchResults.length} Students Found - Select One
                        </Typography>
                        <List>
                            {searchResults.map((student) => (
                                <ListItemButton key={student.user_id} onClick={() => selectStudent(student)}>
                                    <Stack direction="row" spacing={2} alignItems="center" width="100%">
                                        <Avatar>{student.name?.charAt(0)?.toUpperCase()}</Avatar>
                                        <Box flex={1}>
                                            <Typography variant="body1" fontWeight="bold">
                                                {student.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                📞 {student.phone} | 📚 {student.class} - {student.section}
                                            </Typography>
                                        </Box>
                                        <Box textAlign="right">
                                            <Typography variant="caption" color="text.secondary">
                                                Balance Due
                                            </Typography>
                                            <Typography variant="h6" color="error.main">
                                                ₹{student.fee_summary?.balance?.toLocaleString()}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </ListItemButton>
                            ))}
                        </List>
                    </Paper>
                )}

                {/* Payment Dialog */}
                <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        Record Payment {selectedInstallment && `- ${selectedInstallment.installment_name}`}
                    </DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} mt={1}>
                            <TextField
                                label="Amount"
                                type="number"
                                value={paymentData.amount_paid}
                                onChange={(e) => setPaymentData(prev => ({ ...prev, amount_paid: e.target.value }))}
                                required
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconCurrencyRupee size={18} />
                                        </InputAdornment>
                                    )
                                }}
                            />
                            <FormControl fullWidth>
                                <InputLabel>Payment Mode</InputLabel>
                                <Select
                                    value={paymentData.payment_mode}
                                    onChange={(e) => setPaymentData(prev => ({ ...prev, payment_mode: e.target.value }))}
                                    label="Payment Mode"
                                >
                                    {paymentModes.map(mode => (
                                        <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                label="Payment Date"
                                type="date"
                                value={paymentData.payment_date}
                                onChange={(e) => setPaymentData(prev => ({ ...prev, payment_date: e.target.value }))}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                            {['ONLINE', 'UPI', 'CARD'].includes(paymentData.payment_mode) && (
                                <TextField
                                    label="Transaction ID"
                                    value={paymentData.transaction_id}
                                    onChange={(e) => setPaymentData(prev => ({ ...prev, transaction_id: e.target.value }))}
                                    fullWidth
                                />
                            )}
                            {paymentData.payment_mode === 'CHEQUE' && (
                                <>
                                    <TextField
                                        label="Cheque Number"
                                        value={paymentData.cheque_number}
                                        onChange={(e) => setPaymentData(prev => ({ ...prev, cheque_number: e.target.value }))}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Bank Name"
                                        value={paymentData.bank_name}
                                        onChange={(e) => setPaymentData(prev => ({ ...prev, bank_name: e.target.value }))}
                                        fullWidth
                                    />
                                </>
                            )}
                            <TextField
                                label="Remarks"
                                value={paymentData.remarks}
                                onChange={(e) => setPaymentData(prev => ({ ...prev, remarks: e.target.value }))}
                                multiline
                                rows={2}
                                fullWidth
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenPaymentDialog(false)} variant="outlined">
                            Cancel
                        </Button>
                        <Button onClick={submitPayment} variant="contained">
                            Submit Payment
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Installment Dialog */}
                <InstallmentDialog
                    open={openInstallmentDialog}
                    onClose={() => setOpenInstallmentDialog(false)}
                    studentFee={selectedFee}
                    onSuccess={() => fetchFeeSummary(selectedStudent.user_id)}
                />
            </MainCard>
        </>
    );
};

export default FeeCollection;
