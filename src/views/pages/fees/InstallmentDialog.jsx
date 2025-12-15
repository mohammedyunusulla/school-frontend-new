// components/fees/InstallmentDialog.jsx - Enhanced with Auto-Recurring Support

import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { IconCalendar, IconPlus, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FEES_API_BASE_URL } from '../../../ApiConstants';
import customAxios from '../../../utils/axiosConfig';

const InstallmentDialog = ({ open, onClose, studentFee, onSuccess }) => {
    const { loggedUser } = useSelector(state => ({
        loggedUser: state.globalState?.loggedUser || null
    }));

    const [loading, setLoading] = useState(false);
    const [installmentMode, setInstallmentMode] = useState('manual'); // 'auto-recurring' or 'manual'
    const [numberOfInstallments, setNumberOfInstallments] = useState(3);
    const [installments, setInstallments] = useState([]);

    // Auto-recurring preview
    const [recurringPreview, setRecurringPreview] = useState([]);

    useEffect(() => {
        if (open && studentFee) {
            // Reset state when dialog opens
            const isRecurring = studentFee.fee_structure?.is_recurring;
            setInstallmentMode(isRecurring ? 'auto-recurring' : 'manual');

            if (isRecurring) {
                generateRecurringPreview();
            } else {
                initializeManualInstallments();
            }
        }
    }, [open, studentFee]);

    // Generate preview for auto-recurring installments
    const generateRecurringPreview = () => {
        if (!studentFee?.fee_structure) return;

        const { recurrence_type, recurrence_amount, recurrence_months } = studentFee.fee_structure;
        const baseDate = dayjs(studentFee.due_date || new Date());
        const preview = [];

        const amount = parseFloat(recurrence_amount || 0);
        const periods = parseInt(recurrence_months || 0);

        if (recurrence_type === 'MONTHLY') {
            for (let i = 0; i < periods; i++) {
                preview.push({
                    name: `Month ${i + 1}`,
                    amount: amount,
                    dueDate: baseDate.add(i * 30, 'days').format('YYYY-MM-DD')
                });
            }
        } else if (recurrence_type === 'QUARTERLY') {
            for (let i = 0; i < periods; i++) {
                preview.push({
                    name: `Quarter ${i + 1}`,
                    amount: amount,
                    dueDate: baseDate.add(i * 90, 'days').format('YYYY-MM-DD')
                });
            }
        } else if (recurrence_type === 'YEARLY') {
            for (let i = 0; i < periods; i++) {
                preview.push({
                    name: `Year ${i + 1}`,
                    amount: amount,
                    dueDate: baseDate.add(i * 365, 'days').format('YYYY-MM-DD')
                });
            }
        }

        setRecurringPreview(preview);
    };

    // Initialize manual installments
    const initializeManualInstallments = () => {
        const balance = parseFloat(studentFee?.balance_amount || 0);
        const defaultInstallments = 3;
        const amountPerInstallment = (balance / defaultInstallments).toFixed(2);
        const baseDate = dayjs(studentFee?.due_date || new Date());

        const initialInstallments = Array.from({ length: defaultInstallments }, (_, i) => ({
            id: Date.now() + i,
            installment_name: `Installment ${i + 1}`,
            amount: amountPerInstallment,
            due_date: baseDate.add(i * 30, 'days').format('YYYY-MM-DD')
        }));

        setInstallments(initialInstallments);
        setNumberOfInstallments(defaultInstallments);
    };

    // Handle change in number of installments (manual mode)
    const handleInstallmentCountChange = (count) => {
        setNumberOfInstallments(count);
        const balance = parseFloat(studentFee?.balance_amount || 0);
        const amountPerInstallment = (balance / count).toFixed(2);
        const baseDate = dayjs(studentFee?.due_date || new Date());

        const newInstallments = Array.from({ length: count }, (_, i) => ({
            id: Date.now() + i,
            installment_name: `Installment ${i + 1}`,
            amount: amountPerInstallment,
            due_date: baseDate.add(i * 30, 'days').format('YYYY-MM-DD')
        }));

        setInstallments(newInstallments);
    };

    // Add manual installment
    const addInstallment = () => {
        const lastDueDate = installments.length > 0
            ? dayjs(installments[installments.length - 1].due_date)
            : dayjs(studentFee?.due_date || new Date());

        setInstallments([
            ...installments,
            {
                id: Date.now(),
                installment_name: `Installment ${installments.length + 1}`,
                amount: '',
                due_date: lastDueDate.add(30, 'days').format('YYYY-MM-DD')
            }
        ]);
    };

    // Remove manual installment
    const removeInstallment = (id) => {
        if (installments.length <= 1) {
            toast.error('At least one installment is required');
            return;
        }
        setInstallments(installments.filter(inst => inst.id !== id));
    };

    // Update manual installment
    const updateInstallment = (id, field, value) => {
        setInstallments(installments.map(inst =>
            inst.id === id ? { ...inst, [field]: value } : inst
        ));
    };

    // Calculate total
    const calculateTotal = () => {
        if (installmentMode === 'auto-recurring') {
            return recurringPreview.reduce((sum, inst) => sum + parseFloat(inst.amount || 0), 0);
        } else {
            return installments.reduce((sum, inst) => sum + parseFloat(inst.amount || 0), 0);
        }
    };

    const handleSubmit = async () => {
        try {
            const expectedTotal = parseFloat(studentFee?.balance_amount || 0);
            const actualTotal = calculateTotal();

            // Validation
            if (Math.abs(actualTotal - expectedTotal) > 0.01) {
                toast.error(
                    `Total installment amount (₹${actualTotal.toFixed(2)}) must equal fee balance (₹${expectedTotal.toFixed(2)})`
                );
                return;
            }

            setLoading(true);

            if (installmentMode === 'auto-recurring') {
                // ✅ Use backend auto-generate API
                const response = await customAxios.post(
                    `${FEES_API_BASE_URL}/installments/auto-generate-recurring`,
                    { student_fee_id: studentFee.id, skid: loggedUser?.skid }
                );

                if (response.data.code === 200) {
                    toast.success(response.data.message);
                    onSuccess();
                    onClose();
                }
            } else {
                // ✅ Use manual create API
                const installmentData = installments.map(inst => ({
                    installment_name: inst.installment_name,
                    amount: parseFloat(inst.amount),
                    due_date: inst.due_date
                }));

                const response = await customAxios.post(
                    `${FEES_API_BASE_URL}/installments/create/${loggedUser?.skid}`,
                    {
                        student_fee_id: studentFee.id,
                        installments: installmentData
                    }
                );

                if (response.data.code === 200) {
                    toast.success(`${installmentData.length} installments created successfully`);
                    onSuccess();
                    onClose();
                }
            }
        } catch (error) {
            console.error('Error creating installments:', error);
            toast.error(error.response?.data?.message || 'Failed to create installments');
        } finally {
            setLoading(false);
        }
    };


    const handleClose = () => {
        setInstallments([]);
        setRecurringPreview([]);
        setInstallmentMode('manual');
        onClose();
    };

    if (!studentFee) return null;

    const totalInstallmentAmount = calculateTotal();
    const expectedAmount = parseFloat(studentFee.balance_amount || 0);
    const isValidTotal = Math.abs(totalInstallmentAmount - expectedAmount) < 0.01;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Setup Installments</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {studentFee.fee_structure?.fee_name}
                    </Typography>
                </Stack>
            </DialogTitle>

            <DialogContent>
                {/* Fee Info Banner */}
                <Alert severity="info" sx={{ mb: 3 }}>
                    <Stack direction="row" justifyContent="space-between">
                        <Box>
                            <Typography variant="body2" fontWeight="bold">
                                Total Fee Amount: ₹{studentFee.total_amount?.toLocaleString()}
                            </Typography>
                            <Typography variant="caption">
                                Balance to pay: ₹{studentFee.balance_amount?.toLocaleString()}
                            </Typography>
                        </Box>
                        {studentFee.fee_structure?.is_recurring && (
                            <Box textAlign="right">
                                <Typography variant="caption" color="primary">
                                    Recurring: {studentFee.fee_structure.recurrence_type}
                                </Typography>
                                <Typography variant="caption" display="block">
                                    ₹{studentFee.fee_structure.recurrence_amount} × {studentFee.fee_structure.recurrence_months} periods
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                </Alert>

                {/* Mode Selection - Only show if recurring */}
                {studentFee.fee_structure?.is_recurring && (
                    <Box mb={3}>
                        <Typography variant="subtitle2" gutterBottom>
                            Choose Installment Method
                        </Typography>
                        <RadioGroup
                            value={installmentMode}
                            onChange={(e) => {
                                setInstallmentMode(e.target.value);
                                if (e.target.value === 'auto-recurring') {
                                    generateRecurringPreview();
                                } else {
                                    initializeManualInstallments();
                                }
                            }}
                        >
                            <FormControlLabel
                                value="auto-recurring"
                                control={<Radio />}
                                label={
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">
                                            Auto-generate {studentFee.fee_structure.recurrence_type} Installments
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Automatically creates {studentFee.fee_structure.recurrence_months} installments based on {studentFee.fee_structure.recurrence_type.toLowerCase()} schedule
                                        </Typography>
                                    </Box>
                                }
                            />
                            <FormControlLabel
                                value="manual"
                                control={<Radio />}
                                label={
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">
                                            Create Custom Installments
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Manually define installment amounts and due dates
                                        </Typography>
                                    </Box>
                                }
                            />
                        </RadioGroup>
                    </Box>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Auto-Recurring Preview */}
                {installmentMode === 'auto-recurring' && (
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            Installment Schedule Preview
                        </Typography>
                        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                            {recurringPreview.map((inst, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        p: 2,
                                        mb: 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        bgcolor: 'grey.50'
                                    }}
                                >
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={1}>
                                            <Typography variant="body2" fontWeight="bold" color="primary">
                                                #{index + 1}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="body2">{inst.name}</Typography>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <Typography variant="body2" fontWeight="bold">
                                                ₹{inst.amount.toLocaleString()}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="caption" color="text.secondary">
                                                Due: {dayjs(inst.dueDate).format('MMM DD, YYYY')}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Manual Installments */}
                {installmentMode === 'manual' && (
                    <Box>
                        {/* Quick Number Selection */}
                        <Box mb={2}>
                            <Typography variant="subtitle2" gutterBottom>
                                Number of Installments
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                {[2, 3, 4, 6, 12].map(num => (
                                    <Button
                                        key={num}
                                        variant={numberOfInstallments === num ? 'contained' : 'outlined'}
                                        size="small"
                                        onClick={() => handleInstallmentCountChange(num)}
                                    >
                                        {num}
                                    </Button>
                                ))}
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={addInstallment}
                                    startIcon={<IconPlus size={16} />}
                                >
                                    Custom
                                </Button>
                            </Stack>
                        </Box>

                        {/* Installment List */}
                        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                            {installments.map((inst, index) => (
                                <Box
                                    key={inst.id}
                                    sx={{
                                        p: 2,
                                        mb: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1
                                    }}
                                >
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Name"
                                                value={inst.installment_name}
                                                onChange={(e) =>
                                                    updateInstallment(inst.id, 'installment_name', e.target.value)
                                                }
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                type="number"
                                                label="Amount (₹)"
                                                value={inst.amount}
                                                onChange={(e) =>
                                                    updateInstallment(inst.id, 'amount', e.target.value)
                                                }
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                type="date"
                                                label="Due Date"
                                                value={inst.due_date}
                                                onChange={(e) =>
                                                    updateInstallment(inst.id, 'due_date', e.target.value)
                                                }
                                                InputLabelProps={{ shrink: true }}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={1}>
                                            <IconButton
                                                color="error"
                                                onClick={() => removeInstallment(inst.id)}
                                                disabled={installments.length === 1}
                                            >
                                                <IconTrash size={18} />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Total Summary */}
                <Box mt={3} p={2} bgcolor={isValidTotal ? 'success.lighter' : 'error.lighter'} borderRadius={1}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                                Total Installment Amount:
                            </Typography>
                            <Typography variant="h6" color={isValidTotal ? 'success.main' : 'error.main'}>
                                ₹{totalInstallmentAmount.toLocaleString()}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                                Expected Amount:
                            </Typography>
                            <Typography variant="h6">
                                ₹{expectedAmount.toLocaleString()}
                            </Typography>
                        </Grid>
                    </Grid>
                    {!isValidTotal && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                            Total installment amount must equal the fee balance amount
                        </Alert>
                    )}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} variant="outlined">
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !isValidTotal}
                >
                    {installmentMode === 'auto-recurring' ? 'Generate Installments' : 'Create Installments'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InstallmentDialog;
