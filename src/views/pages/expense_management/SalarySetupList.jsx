import {
    Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
    Grid, IconButton, InputLabel, MenuItem, OutlinedInput, Select, Stack, Typography,
} from '@mui/material';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { Popconfirm, Table } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { EXPENSE_API_BASE_URL, USERS_API_BASE_URL } from '../../../ApiConstants';
import { inputStyles, labelStyles } from '../../../AppConstants';
import EduSphereLoader from '../../../ui-component/EduSphereLoader';
import HeaderCard from '../../../ui-component/cards/HeaderCard';
import customAxios from '../../../utils/axiosConfig';
import MandatoryIndicator from '../components/MandatoryIndicator';

const SalarySetupList = () => {
    const { loggedUser, academicYear } = useSelector(state => ({
        loggedUser: state.globalState?.loggedUser || null,
        academicYear: state.globalState?.academicYear || null
    }));
    const [staffList, setStaffList] = useState([]);
    const [salarySetups, setSalarySetups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        staff_id: null,
        basic_salary: null,
        allowances: { hra: null, da: null, transport: null },
        deductions: { pf: null, tax: null },
        effective_from: null
    });

    const columns = [
        {
            title: 'Staff Name',
            dataIndex: 'staff_name',
            key: 'staff_name',
            sorter: (a, b) => a.staff_name.localeCompare(b.staff_name)
        },
        {
            title: 'Employee ID',
            dataIndex: 'employee_id',
            key: 'employee_id',
            render: (id) => id || 'N/A'
        },
        {
            title: 'Basic Salary',
            dataIndex: 'basic_salary',
            key: 'basic_salary',
            render: (amount) => `₹${parseFloat(amount).toLocaleString()}`
        },
        {
            title: 'Gross Salary',
            dataIndex: 'gross_salary',
            key: 'gross_salary',
            render: (amount) => `₹${parseFloat(amount).toLocaleString()}`
        },
        {
            title: 'Net Salary',
            dataIndex: 'net_salary',
            key: 'net_salary',
            render: (amount) => (
                <strong style={{ color: '#1976d2' }}>
                    ₹{parseFloat(amount).toLocaleString()}
                </strong>
            )
        },
        {
            title: 'Effective From',
            dataIndex: 'effective_from',
            key: 'effective_from',
            render: (date) => new Date(date).toLocaleDateString('en-IN')
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (is_active) => (
                <Chip
                    label={is_active ? 'Active' : 'Inactive'}
                    size="small"
                    color={is_active ? 'primary' : 'error'}
                />
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Stack direction="row" spacing={1}>
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(record)}
                    >
                        <IconEdit size={18} />
                    </IconButton>
                    <Popconfirm
                        title="Delete Salary Setup"
                        description="Are you sure you want to delete this salary setup?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <IconButton size="small" color="error">
                            <IconTrash size={18} />
                        </IconButton>
                    </Popconfirm>
                </Stack>
            )
        }
    ];

    useEffect(() => {
        fetchSalarySetups();
    }, []);

    useEffect(() => {
        if (openDialog) {
            fetchStaffList();
        }
    }, [openDialog]);

    const fetchSalarySetups = async () => {
        setLoading(true);
        try {
            const response = await customAxios.get(
                `${EXPENSE_API_BASE_URL}/list/salary-setup/${loggedUser.skid}?academic_year_id=${academicYear?.id}`
            );
            setSalarySetups(response.data.salary_setups);
        } catch (error) {
            console.error('Error fetching salary setups:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStaffList = async () => {
        try {
            const response = await customAxios.get(`${USERS_API_BASE_URL}/list/staff/${loggedUser.skid}`);
            setStaffList(response?.data?.staff);
        } catch (error) {
            console.error('Error fetching staff:', error);
        }
    };

    const handleEdit = (record) => {
        setIsEditMode(true);
        setFormData({
            id: record.id,
            staff_id: record.staff_id,
            basic_salary: record.basic_salary,
            allowances: record.allowances || { hra: null, da: null, transport: null },
            deductions: record.deductions || { pf: null, tax: null },
            effective_from: record.effective_from
        });
        setOpenDialog(true);
    };

    const handleDelete = async (setupId) => {
        try {
            await customAxios.delete(
                `${EXPENSE_API_BASE_URL}/salary-setup/delete/${loggedUser.skid}/${setupId}`
            );
            alert('Salary setup deleted successfully!');
            fetchSalarySetups();
        } catch (error) {
            console.error('Error deleting salary setup:', error);
            alert(error.response?.data?.message || 'Failed to delete salary setup');
        }
    };

    const handleSubmit = async () => {
        try {
            // Validate required fields
            if (!formData.staff_id || !formData.basic_salary || !formData.effective_from) {
                alert('Please fill all required fields');
                return;
            }

            // Convert allowances to numbers and filter empty values
            const cleanAllowances = {};
            Object.entries(formData.allowances).forEach(([key, value]) => {
                if (value && value !== '') {
                    cleanAllowances[key] = parseFloat(value);
                }
            });

            // Convert deductions to numbers and filter empty values
            const cleanDeductions = {};
            Object.entries(formData.deductions).forEach(([key, value]) => {
                if (value && value !== '') {
                    cleanDeductions[key] = parseFloat(value);
                }
            });

            const payload = {
                staff_id: parseInt(formData.staff_id),
                basic_salary: parseFloat(formData.basic_salary),
                allowances: cleanAllowances,
                deductions: cleanDeductions,
                effective_from: formData.effective_from,
                academic_year_id: academicYear?.id
            };

            if (isEditMode) {
                // Update existing setup
                payload.id = formData.id;
                await customAxios.put(
                    `${EXPENSE_API_BASE_URL}/salary-setup/update/${loggedUser.skid}`,
                    payload
                );
                alert('Salary setup updated successfully!');
            } else {
                // Create new setup
                await customAxios.post(
                    `${EXPENSE_API_BASE_URL}/salary-setup/${loggedUser.skid}`,
                    payload
                );
                alert('Salary setup created successfully!');
            }

            setOpenDialog(false);
            fetchSalarySetups();
            resetForm();
        } catch (error) {
            console.error('Error saving salary setup:', error);
            alert(error.response?.data?.message || 'Failed to save salary setup');
        }
    };

    const resetForm = () => {
        setIsEditMode(false);
        setFormData({
            id: null,
            staff_id: null,
            basic_salary: null,
            allowances: { hra: null, da: null, transport: null },
            deductions: { pf: null, tax: null },
            effective_from: null
        });
    };

    const calculateTotals = () => {
        const basic = parseFloat(formData.basic_salary) || 0;
        const allowancesTotal = Object.values(formData.allowances)
            .reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        const deductionsTotal = Object.values(formData.deductions)
            .reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

        return {
            gross: basic + allowancesTotal,
            net: basic + allowancesTotal - deductionsTotal
        };
    };

    const totals = calculateTotals();

    const breadcrumbLinks = [
        { title: 'Dashboard', to: '/dashboard' },
        { title: 'Salary Setup', to: '/salary-setup' },
    ];

    return (
        <>
            <EduSphereLoader loading={loading} />
            <HeaderCard
                heading={'Staff Salary/Payroll Setup'}
                breadcrumbLinks={breadcrumbLinks}
                buttonColor={'primary'}
                buttonvariant={'contained'}
                buttonText="Add Salary Setup"
                onButtonClick={() => {
                    resetForm();
                    setOpenDialog(true);
                }}
                buttonIcon={<IconPlus size={20} />}
            />

            <Table
                columns={columns}
                dataSource={salarySetups}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1000 }}
            />

            {/* Salary Setup Dialog */}
            <Dialog open={openDialog} onClose={() => { setOpenDialog(false); resetForm(); }} maxWidth="md" fullWidth>
                <DialogTitle>
                    {isEditMode ? 'Edit Salary Setup' : 'Setup Staff Salary'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item size={{ xl: 4, lg: 4, md: 4, sm: 4, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="staff_id" sx={labelStyles}>
                                    <MandatoryIndicator label="Select Staff" isRequired={true} />
                                </InputLabel>
                                <Select
                                    id="staff_id"
                                    name="staff_id"
                                    fullWidth
                                    required
                                    value={formData.staff_id}
                                    onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                                    disabled={isEditMode}  // Disable staff selection in edit mode
                                    sx={inputStyles}
                                >
                                    {staffList.map((staff) => (
                                        <MenuItem key={staff.id} value={staff.id}>
                                            <Box>
                                                <Typography variant="body1">
                                                    {staff.full_name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {staff.profile?.employee_id || 'No ID'} • {staff.role_name}
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Stack>
                        </Grid>

                        <Grid item size={{ xl: 4, lg: 4, md: 4, sm: 4, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="basic_salary" sx={labelStyles}>
                                    <MandatoryIndicator label="Basic Salary" isRequired={true} />
                                </InputLabel>
                                <OutlinedInput
                                    fullWidth
                                    required
                                    id="basic_salary"
                                    name="basic_salary"
                                    type="number"
                                    value={formData.basic_salary}
                                    onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                                    inputProps={{ min: 0, step: 0.01 }}
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>
                        <Grid item size={{ xl: 4, lg: 4, md: 4, sm: 4, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="effective_from" sx={labelStyles}>
                                    <MandatoryIndicator label="Effective From" isRequired={true} />
                                </InputLabel>
                                <OutlinedInput
                                    id="effective_from"
                                    name="effective_from"
                                    fullWidth
                                    required
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={formData.effective_from}
                                    onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} sx={{ mt: 3 }}>
                        <Grid item size={{ xl: 12, lg: 12, md: 12, sm: 4, xs: 12, }}>
                            <Typography variant="subtitle1" sx={{ mb: -2 }} >Allowances</Typography>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item size={{ xl: 4, lg: 4, md: 4, sm: 4, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="hra" sx={labelStyles}>
                                    HRA
                                </InputLabel>
                                <OutlinedInput
                                    id="hra"
                                    name="hra"
                                    fullWidth
                                    type="number"
                                    value={formData.allowances.hra}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        allowances: { ...formData.allowances, hra: e.target.value }
                                    })}
                                    inputProps={{ min: 0, step: 0.01 }}
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>
                        <Grid item size={{ xl: 4, lg: 4, md: 4, sm: 4, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="da" sx={labelStyles}>
                                    DA
                                </InputLabel>
                                <OutlinedInput
                                    id="da"
                                    name="da"
                                    fullWidth
                                    type="number"
                                    value={formData.allowances.da}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        allowances: { ...formData.allowances, da: e.target.value }
                                    })}
                                    inputProps={{ min: 0, step: 0.01 }}
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>
                        <Grid item size={{ xl: 4, lg: 4, md: 4, sm: 4, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="transport" sx={labelStyles}>
                                    Transport Allowance
                                </InputLabel>
                                <OutlinedInput
                                    id="transport"
                                    name="transport"
                                    fullWidth
                                    type="number"
                                    value={formData.allowances.transport}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        allowances: { ...formData.allowances, transport: e.target.value }
                                    })}
                                    inputProps={{ min: 0, step: 0.01 }}
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} sx={{ mt: 3 }}>
                        <Grid item size={{ xl: 12, lg: 12, md: 12, sm: 4, xs: 12, }}>
                            <Typography variant="subtitle1" sx={{ mb: -2 }} >Deductions</Typography>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item size={{ xl: 4, lg: 4, md: 4, sm: 4, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="pf" sx={labelStyles}>
                                    PF
                                </InputLabel>
                                <OutlinedInput
                                    id="pf"
                                    name="pf"
                                    fullWidth
                                    type="number"
                                    value={formData.deductions.pf}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        deductions: { ...formData.deductions, pf: e.target.value }
                                    })}
                                    inputProps={{ min: 0, step: 0.01 }}
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>
                        <Grid item size={{ xl: 4, lg: 4, md: 4, sm: 4, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="tax" sx={labelStyles}>
                                    Tax
                                </InputLabel>
                                <OutlinedInput
                                    id="tax"
                                    name="tax"
                                    fullWidth
                                    type="number"
                                    value={formData.deductions.tax}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        deductions: { ...formData.deductions, tax: e.target.value }
                                    })}
                                    inputProps={{ min: 0, step: 0.01 }}
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item size={{ xl: 12, lg: 12, md: 12, sm: 12, xs: 12, }}    >
                            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                                <Grid container spacing={2}>
                                    <Grid item size={{ xl: 6, lg: 6, md: 6, sm: 6, xs: 12 }}
                                        sx={{ display: "flex", alignItems: 'center', gap: 2 }}
                                    >
                                        <Typography variant="body2">Gross Salary:</Typography>
                                        <Typography variant="h6" color="primary">
                                            ₹{totals.gross.toLocaleString()}
                                        </Typography>
                                    </Grid>
                                    <Grid item size={{ xl: 6, lg: 6, md: 6, sm: 6, xs: 12, }}
                                        sx={{ display: "flex", alignItems: 'center', gap: 2 }}
                                    >
                                        <Typography variant="body2">Net Salary:</Typography>
                                        <Typography variant="h6" color="success.main">
                                            ₹{totals.net.toLocaleString()}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setOpenDialog(false); resetForm(); }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        {isEditMode ? 'Update' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SalarySetupList;