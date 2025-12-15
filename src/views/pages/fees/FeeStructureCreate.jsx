// components/fees/FeeStructureCreate.jsx - Enhanced with Recurring Payment Support

import {
    Alert,
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from '@mui/material';
import { IconArrowLeft, IconCurrencyRupee, IconPlus, IconTrash } from '@tabler/icons-react';
import { Table } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CLASSES_API_BASE_URL, FEES_API_BASE_URL } from '../../../ApiConstants';
import HeaderCard from '../../../ui-component/cards/HeaderCard';
import MainCard from '../../../ui-component/cards/MainCard';
import EduSphereLoader from '../../../ui-component/EduSphereLoader';
import customAxios from '../../../utils/axiosConfig';

const FeeStructureCreate = () => {
    const { loggedUser, academicYear } = useSelector(state => ({
        loggedUser: state.globalState?.loggedUser || null,
        academicYear: state.globalState?.academicYear || null
    }));

    const navigate = useNavigate();
    const { class_id, academic_year } = useParams();
    const isEditMode = !!class_id;

    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [formData, setFormData] = useState({
        academic_year_id: academic_year || academicYear?.id,
        class_id: class_id || null,
    });

    const [feeRows, setFeeRows] = useState([
        {
            id: Date.now(),
            fee_name: 'TUITION',
            amount: null,
            is_mandatory: true,
            description: null,
            is_recurring: false,
            recurrence_type: 'ONE_TIME',
            recurrence_amount: null,
            recurrence_months: null,
            allows_installments: false
        }
    ]);

    const fee_name = [
        'TUITION', 'ADMISSION', 'EXAM', 'LIBRARY', 'SPORTS',
        'TRANSPORT', 'HOSTEL', 'LAB', 'ACTIVITY', 'LATE_FEE', 'OTHER'
    ];

    const recurrence_types = [
        { value: 'ONE_TIME', label: 'One Time' },
        { value: 'MONTHLY', label: 'Monthly' },
        { value: 'QUARTERLY', label: 'Quarterly' },
        { value: 'YEARLY', label: 'Yearly' }
    ];

    useEffect(() => {
        fetchClasses();
        if (isEditMode) {
            fetchExistingFees();
        }
    }, [academicYear]);

    const fetchClasses = async () => {
        try {
            const response = await customAxios.get(
                `${CLASSES_API_BASE_URL}/list/${loggedUser?.skid}`
            );
            if (response.data.code === 200) {
                setClasses(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const fetchExistingFees = async () => {
        try {
            setLoading(true);
            const params = {
                academic_year_id: academicYear?.id,
                class_id: class_id
            };
            const response = await customAxios.get(
                `${FEES_API_BASE_URL}/structure/list/${loggedUser?.skid}`,
                { params }
            );

            if (response.data.code === 200) {
                const existingFees = response.data.data || [];
                if (existingFees.length > 0) {
                    setFeeRows(existingFees.map(fee => ({
                        id: fee.id,
                        fee_id: fee.id,
                        fee_name: fee.fee_name,
                        amount: fee.amount,
                        is_mandatory: fee.is_mandatory,
                        description: fee.description,
                        is_recurring: fee.is_recurring || false,
                        recurrence_type: fee.recurrence_type || 'ONE_TIME',
                        recurrence_amount: fee.recurrence_amount,
                        recurrence_months: fee.recurrence_months,
                        allows_installments: fee.allows_installments !== false
                    })));
                }
            }
        } catch (error) {
            console.error('Error fetching existing fees:', error);
            toast.error('Failed to load existing fee structure');
        } finally {
            setLoading(false);
        }
    };

    const addFeeRow = () => {
        setFeeRows([
            ...feeRows,
            {
                id: Date.now(),
                fee_name: 'TUITION',
                amount: null,
                is_mandatory: true,
                description: null,
                is_recurring: false,
                recurrence_type: 'ONE_TIME',
                recurrence_amount: null,
                recurrence_months: null,
                allows_installments: false
            }
        ]);
    };

    const removeFeeRow = async (row) => {
        if (feeRows.length === 1) {
            toast.error('At least one fee is required');
            return;
        }

        if (row.fee_id) {
            if (window.confirm('Are you sure you want to delete this fee?')) {
                try {
                    setLoading(true);
                    await customAxios.delete(
                        `${FEES_API_BASE_URL}/structure/delete/${loggedUser?.skid}/${row.fee_id}`
                    );
                    toast.success('Fee deleted successfully');
                    setFeeRows(feeRows.filter(r => r.id !== row.id));
                } catch (error) {
                    console.error('Error deleting fee:', error);
                    toast.error('Failed to delete fee');
                } finally {
                    setLoading(false);
                }
            }
        } else {
            setFeeRows(feeRows.filter(r => r.id !== row.id));
        }
    };

    // NEW: Calculate total amount based on recurring settings
    const calculateTotalAmount = (row) => {
        if (!row.is_recurring) {
            return parseFloat(row.amount) || 0;
        }

        const recurrenceAmount = parseFloat(row.recurrence_amount) || 0;
        const recurrenceMonths = parseInt(row.recurrence_months) || 0;

        if (row.recurrence_type === 'ONE_TIME') {
            return parseFloat(row.amount) || 0;
        }

        return recurrenceAmount * recurrenceMonths;
    };

    const updateFeeRow = (id, field, value) => {
        setFeeRows(feeRows.map(row => {
            if (row.id === id) {
                const updatedRow = { ...row, [field]: value };

                // Auto-calculate total amount for recurring fees
                if (field === 'is_recurring') {
                    if (value === true) {
                        // Switching to recurring
                        updatedRow.recurrence_type = 'MONTHLY';
                        updatedRow.recurrence_amount = null;
                        updatedRow.recurrence_months = null;
                        updatedRow.amount = null;
                    } else {
                        // Switching to one-time
                        updatedRow.recurrence_type = 'ONE_TIME';
                        updatedRow.recurrence_amount = null;
                        updatedRow.recurrence_months = null;
                    }
                }

                // Auto-calculate amount when recurring values change
                if (updatedRow.is_recurring &&
                    (field === 'recurrence_amount' || field === 'recurrence_months' || field === 'recurrence_type')) {
                    const recAmount = parseFloat(updatedRow.recurrence_amount) || 0;
                    const recMonths = parseInt(updatedRow.recurrence_months) || 0;
                    updatedRow.amount = recAmount * recMonths;
                }

                return updatedRow;
            }
            return row;
        }));
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.class_id) {
            toast.error('Please select a class');
            return;
        }

        // Enhanced validation for recurring fees
        const invalidRows = feeRows.filter(row => {
            if (!row.fee_name) return true;

            if (row.is_recurring) {
                // For recurring fees, check recurrence fields
                if (!row.recurrence_amount || !row.recurrence_months) {
                    return true;
                }
            } else {
                // For one-time fees, check amount
                if (!row.amount) return true;
            }
            return false;
        });

        if (invalidRows.length > 0) {
            toast.error('Please fill all required fields for each fee');
            return;
        }

        try {
            setLoading(true);

            if (isEditMode) {
                const promises = feeRows.map(fee => {
                    const payload = {
                        fee_name: fee.fee_name,
                        amount: calculateTotalAmount(fee),
                        is_mandatory: fee.is_mandatory,
                        description: fee.description,
                        is_recurring: fee.is_recurring,
                        recurrence_type: fee.recurrence_type,
                        recurrence_amount: fee.is_recurring ? fee.recurrence_amount : null,
                        recurrence_months: fee.is_recurring ? fee.recurrence_months : null,
                        allows_installments: fee.allows_installments
                    };

                    if (fee.fee_id) {
                        return customAxios.put(
                            `${FEES_API_BASE_URL}/structure/update/${loggedUser?.skid}/${fee.fee_id}`,
                            payload
                        );
                    } else {
                        return customAxios.post(
                            `${FEES_API_BASE_URL}/structure/create/${loggedUser?.skid}`,
                            { ...formData, ...payload }
                        );
                    }
                });

                await Promise.all(promises);
                toast.success('Fee structure updated successfully');
            } else {
                const promises = feeRows.map(fee =>
                    customAxios.post(`${FEES_API_BASE_URL}/structure/create/${loggedUser?.skid}`, {
                        ...formData,
                        fee_name: fee.fee_name,
                        amount: calculateTotalAmount(fee),
                        is_mandatory: fee.is_mandatory,
                        description: fee.description,
                        is_recurring: fee.is_recurring,
                        recurrence_type: fee.recurrence_type,
                        recurrence_amount: fee.is_recurring ? fee.recurrence_amount : null,
                        recurrence_months: fee.is_recurring ? fee.recurrence_months : null,
                        allows_installments: fee.allows_installments
                    })
                );

                await Promise.all(promises);
                toast.success(`${feeRows.length} fee structure(s) created successfully`);
            }

            navigate('/fee/structures');
        } catch (error) {
            console.error('Error saving fee structures:', error);
            toast.error(error.response?.data?.message || 'Failed to save fee structures');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Fee Name',
            dataIndex: 'fee_name',
            key: 'fee_name',
            width: 180,
            render: (text, record) => (
                <FormControl fullWidth size="small">
                    <Select
                        value={record.fee_name}
                        onChange={(e) => updateFeeRow(record.id, 'fee_name', e.target.value)}
                    >
                        {fee_name.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type.replace('_', ' ')}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'recurrence_type',
            key: 'recurrence_type',
            width: 140,
            render: (text, record) => (
                <FormControl fullWidth size="small">
                    <Select
                        value={record.recurrence_type}
                        onChange={(e) => updateFeeRow(record.id, 'recurrence_type', e.target.value)}
                    >
                        {recurrence_types.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                                {type.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ),
        },
        {
            title: 'Recurring',
            dataIndex: 'is_recurring',
            key: 'is_recurring',
            width: 100,
            align: 'center',
            render: (text, record) => (
                <Checkbox
                    checked={record.is_recurring}
                    onChange={(e) => updateFeeRow(record.id, 'is_recurring', e.target.checked)}
                    disabled={record.recurrence_type === 'ONE_TIME'}
                />
            ),
        },
        {
            title: 'Amount/Period (₹)',
            dataIndex: 'recurrence_amount',
            key: 'recurrence_amount',
            width: 150,
            render: (text, record) => (
                <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={record.is_recurring ? record.recurrence_amount : record.amount}
                    onChange={(e) =>
                        updateFeeRow(
                            record.id,
                            record.is_recurring ? 'recurrence_amount' : 'amount',
                            e.target.value
                        )
                    }
                    placeholder={record.is_recurring ? "Per period" : "Total amount"}
                    required
                    InputProps={{
                        startAdornment: <IconCurrencyRupee size={16} style={{ marginRight: 4 }} />
                    }}
                />
            ),
        },
        {
            title: 'Periods',
            dataIndex: 'recurrence_months',
            key: 'recurrence_months',
            width: 100,
            render: (text, record) => (
                record.is_recurring ? (
                    <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={record.recurrence_months}
                        onChange={(e) => updateFeeRow(record.id, 'recurrence_months', e.target.value)}
                        placeholder="Count"
                        required
                    />
                ) : <Typography variant="body2" align="center">-</Typography>
            ),
        },
        {
            title: 'Total Amount (₹)',
            key: 'calculated_amount',
            width: 140,
            render: (text, record) => (
                <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={calculateTotalAmount(record) > 0 ? 'success.main' : 'text.secondary'}
                >
                    ₹ {calculateTotalAmount(record).toLocaleString()}
                </Typography>
            ),
        },
        {
            title: 'Installments',
            dataIndex: 'allows_installments',
            key: 'allows_installments',
            width: 120,
            align: 'center',
            render: (text, record) => (
                <Checkbox
                    checked={record.allows_installments}
                    onChange={(e) => updateFeeRow(record.id, 'allows_installments', e.target.checked)}
                    disabled={!record.is_recurring}
                />
            ),
        },
        {
            title: 'Mandatory',
            dataIndex: 'is_mandatory',
            key: 'is_mandatory',
            width: 120,
            render: (text, record) => (
                <FormControl fullWidth size="small">
                    <Select
                        value={record.is_mandatory}
                        onChange={(e) => updateFeeRow(record.id, 'is_mandatory', e.target.value)}
                    >
                        <MenuItem value={true}>Yes</MenuItem>
                        <MenuItem value={false}>No</MenuItem>
                    </Select>
                </FormControl>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            width: 80,
            align: 'center',
            render: (_, record) => (
                <IconButton
                    color="error"
                    size="small"
                    onClick={() => removeFeeRow(record)}
                >
                    <IconTrash size={18} />
                </IconButton>
            ),
        },
    ];

    const totalAmount = feeRows.reduce((sum, row) => sum + calculateTotalAmount(row), 0);

    const breadcrumbLinks = [
        { title: 'Dashboard', to: '/dashboard' },
        { title: 'Fee Structures', to: '/fee/structures' },
        { title: (isEditMode ? 'Edit Fee Structure' : 'Create Fee Structure'), to: '/fee/structures' },
    ];

    return (
        <>
            <EduSphereLoader loading={loading} />
            <HeaderCard
                heading={isEditMode ? 'Edit Fee Structure' : 'Create Fee Structure'}
                breadcrumbLinks={breadcrumbLinks}
                buttonColor={'primary'}
                buttonvariant={'variant'}
                onButtonClick={() => navigate('/fee/structures')}
                buttonIcon={<IconArrowLeft color='white' />}
            />

            <MainCard>
                {/* Header */}
                <Typography variant="body2" color="text.secondary" mb={3}>
                    {isEditMode
                        ? 'Update existing fees or add new fees for this class'
                        : 'Add multiple fees for a class. Toggle recurring for fees like tuition (monthly/quarterly/yearly).'
                    }
                </Typography>

                {/* Edit Mode Notice */}
                {isEditMode && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        You are editing fee structure. You can update existing fees, add new fees, or delete fees.
                    </Alert>
                )}

                {/* Class Selection */}
                <Grid container spacing={2} mb={3}>
                    <Grid item size={{ xs: 12, sm: 6, md: 6, lg:4, xl:4 }}>
                        <FormControl fullWidth required>
                            <InputLabel>Select Class</InputLabel>
                            <Select
                                value={formData.class_id}
                                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                label="Select Class"
                                disabled={isEditMode}
                            >
                                {classes.map((cls) => (
                                    <MenuItem key={cls.id} value={cls.id}>
                                        {cls.class_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                {/* Add Fee Button */}
                <Box display="flex" justifyContent="flex-end" mb={2}>
                    <Button
                        variant="outlined"
                        startIcon={<IconPlus />}
                        onClick={addFeeRow}
                    >
                        Add Fee
                    </Button>
                </Box>

                {/* Fee Rows Table */}
                <Table
                    dataSource={feeRows}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    bordered
                    scroll={{ x: 680, y: 400 }}
                />

                {/* Total Amount Display */}
                <Box mt={3} display="flex" justifyContent="flex-end">
                    <Paper elevation={3} sx={{ p: 2, minWidth: 250 }}>
                        <Typography variant="h6" color="text.secondary">
                            Total Amount:
                        </Typography>
                        <Typography variant="h4" color="primary" fontWeight="bold">
                            ₹ {totalAmount.toLocaleString()}
                        </Typography>
                    </Paper>
                </Box>

                {/* Action Buttons */}
                <Box mt={4} display="flex" gap={2} justifyContent="flex-end">
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/fee/structures')}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                        startIcon={<IconCurrencyRupee />}
                    >
                        {isEditMode ? 'Update Fee Structure' : 'Save Fee Structure'}
                    </Button>
                </Box>
            </MainCard>
        </>
    );
};

export default FeeStructureCreate;
