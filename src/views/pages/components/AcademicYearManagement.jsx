import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { IconCalendar, IconCheck, IconEdit, IconPlus, IconX } from '@tabler/icons-react';
import { Table } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { ACADEMIC_YEAR } from '../../../ApiConstants';
import { updateGlobalState } from '../../../store/slices/authSlice';
import customAxios from '../../../utils/axiosConfig';

function AcademicYearManagement({ open, onClose }) {
    const { loggedUser } = useSelector((state) => state.globalState || {});
    const dispatch = useDispatch();
    const [academicYears, setAcademicYears] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [addingNew, setAddingNew] = useState(false);

    // Form state for editing/adding
    const [formData, setFormData] = useState({
        year_name: '',
        start_date: null,
        end_date: null
    });

    useEffect(() => {
        if (open && loggedUser?.academic_years) {
            setAcademicYears(loggedUser.academic_years);
        }
    }, [open, loggedUser]);

    // Helper function to update Redux global state
    const updateGlobalAcademicYears = (updatedYears) => {
        const currentYear = updatedYears.find(y => y.is_current);
        dispatch(updateGlobalState({
            loggedUser: {
                ...loggedUser,
                academic_years: updatedYears,
                current_academic_year: currentYear || loggedUser.current_academic_year
            },
            academicYear: currentYear || loggedUser.current_academic_year
        }));
    };

    const handleStartEdit = (year) => {
        setEditingId(year.id);
        setFormData({
            year_name: year.year_name,
            start_date: dayjs(year.start_date),
            end_date: dayjs(year.end_date)
        });
        setAddingNew(false);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setAddingNew(false);
        setFormData({ year_name: '', start_date: null, end_date: null });
    };

    const handleStartAdd = () => {
        setAddingNew(true);
        setEditingId(null);
        setFormData({ year_name: '', start_date: null, end_date: null });
    };

    const handleSaveEdit = async (yearId) => {
        if (!formData.year_name || !formData.start_date || !formData.end_date) {
            toast.warning('Please fill all fields');
            return;
        }

        if (formData.end_date.isBefore(formData.start_date)) {
            toast.error('End date must be after start date');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                year_name: formData.year_name,
                start_date: formData.start_date.format('YYYY-MM-DD'),
                end_date: formData.end_date.format('YYYY-MM-DD')
            };

            const response = await customAxios.put(
                `${ACADEMIC_YEAR}/update/${loggedUser?.skid}/${yearId}`,
                payload
            );

            if (response.data.code === 200 && response.data.status === 'success') {
                toast.success('Academic year updated successfully');

                // Update local state
                const updatedYears = academicYears.map((year) =>
                    year.id === yearId ? { ...year, ...payload } : year
                );
                setAcademicYears(updatedYears);

                // Update Redux global state
                updateGlobalAcademicYears(updatedYears);

                handleCancelEdit();
            } else {
                toast.error(response.data.message || 'Failed to update academic year');
            }
        } catch (error) {
            console.error('Error updating academic year:', error);
            toast.error(error.response?.data?.message || 'Failed to update academic year');
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = async () => {
        if (!formData.year_name || !formData.start_date || !formData.end_date) {
            toast.warning('Please fill all fields');
            return;
        }

        if (formData.end_date.isBefore(formData.start_date)) {
            toast.error('End date must be after start date');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                year_name: formData.year_name,
                start_date: formData.start_date.format('YYYY-MM-DD'),
                end_date: formData.end_date.format('YYYY-MM-DD'),
                is_current: false,
                is_active: true
            };

            const response = await customAxios.post(
                `${ACADEMIC_YEAR}/create/${loggedUser?.skid}`,
                payload
            );

            if (response.data.code === 200 && response.data.status === 'success') {
                toast.success('Academic year added successfully');

                // Add to local state
                const updatedYears = [...academicYears, response.data.data];
                setAcademicYears(updatedYears);

                // Update Redux global state
                updateGlobalAcademicYears(updatedYears);

                handleCancelEdit();
            } else {
                toast.error(response.data.message || 'Failed to add academic year');
            }
        } catch (error) {
            console.error('Error adding academic year:', error);
            toast.error(error.response?.data?.message || 'Failed to add academic year');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsCurrent = async (yearId) => {
        try {
            setLoading(true);
            const response = await customAxios.patch(
                `${ACADEMIC_YEAR}/patch/${loggedUser?.skid}/${yearId}/set-current`
            );

            if (response.data.code === 200 && response.data.status === 'success') {
                toast.success('Current academic year updated successfully');

                // Update local state: mark all as not current, then mark selected as current
                const updatedYears = academicYears.map((year) => ({
                    ...year,
                    is_current: year.id === yearId
                }));
                setAcademicYears(updatedYears);

                // Update Redux global state with new current year
                updateGlobalAcademicYears(updatedYears);
            } else {
                toast.error(response.data.message || 'Failed to update current year');
            }
        } catch (error) {
            console.error('Error marking as current:', error);
            toast.error(error.response?.data?.message || 'Failed to update current year');
        } finally {
            setLoading(false);
        }
    };

    const renderEditCell = (year = null) => {
        const isNew = !year;
        return {
            year_name: (
                <TextField
                    fullWidth
                    size="small"
                    value={formData.year_name}
                    onChange={(e) => setFormData({ ...formData, year_name: e.target.value })}
                    placeholder="e.g., 2027-2028"
                />
            ),
            start_date: (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        value={formData.start_date}
                        onChange={(newValue) => setFormData({ ...formData, start_date: newValue })}
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                        format="DD/MM/YYYY"
                    />
                </LocalizationProvider>
            ),
            end_date: (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        value={formData.end_date}
                        onChange={(newValue) => setFormData({ ...formData, end_date: newValue })}
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                        format="DD/MM/YYYY"
                        minDate={formData.start_date}
                    />
                </LocalizationProvider>
            ),
            status: !isNew && year?.is_current ? <Chip label="Current" color="success" size="small" /> : null,
            actions: (
                <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title="Save">
                        <Button
                            size="small"
                            color="primary"
                            variant="contained"
                            onClick={() => (isNew ? handleAddNew() : handleSaveEdit(year.id))}
                            disabled={loading}
                            startIcon={<IconCheck size={16} />}
                        >
                            Save
                        </Button>
                    </Tooltip>
                    <Tooltip title="Cancel">
                        <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={handleCancelEdit}
                            disabled={loading}
                            startIcon={<IconX size={16} />}
                        >
                            Cancel
                        </Button>
                    </Tooltip>
                </Stack>
            )
        };
    };

    // Prepare data source
    const dataSource = [];

    // Add "new row" at the top if adding
    if (addingNew) {
        dataSource.push({
            key: 'new',
            id: 'new',
            ...renderEditCell()
        });
    }

    // Add existing years (sorted)
    const sortedYears = [...academicYears].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

    sortedYears.forEach((year) => {
        if (editingId === year.id) {
            dataSource.push({
                key: year.id,
                id: year.id,
                ...renderEditCell(year)
            });
        } else {
            dataSource.push({
                key: year.id,
                id: year.id,
                year_name: (
                    <Typography variant="body2" fontWeight={year.is_current ? 600 : 400}>
                        {year.year_name}
                    </Typography>
                ),
                start_date: (
                    <Typography variant="body2">
                        {dayjs(year.start_date).format('DD/MM/YYYY')}
                    </Typography>
                ),
                end_date: (
                    <Typography variant="body2">
                        {dayjs(year.end_date).format('DD/MM/YYYY')}
                    </Typography>
                ),
                status: year.is_current ? <Chip label="Current" color="success" size="small" /> : null,
                actions: (
                    <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Edit">
                            <Button
                                size="small"
                                color="primary"
                                variant="contained"
                                onClick={() => handleStartEdit(year)}
                                disabled={editingId !== null || addingNew || loading}
                                startIcon={<IconEdit size={16} />}
                            >
                                Edit
                            </Button>
                        </Tooltip>
                        {!year.is_current && (
                            <Tooltip title="Mark as Current">
                                <Button
                                    size="small"
                                    color="success"
                                    variant="contained"
                                    onClick={() => handleMarkAsCurrent(year.id)}
                                    disabled={editingId !== null || addingNew || loading}
                                    startIcon={<IconCheck size={16} />}
                                >
                                    Mark Current
                                </Button>
                            </Tooltip>
                        )}
                    </Stack>
                )
            });
        }
    });

    const columns = [
        {
            title: 'Academic Year',
            dataIndex: 'year_name',
            key: 'year_name',
            width: '20%'
        },
        {
            title: 'Start Date',
            dataIndex: 'start_date',
            key: 'start_date',
            width: '20%'
        },
        {
            title: 'End Date',
            dataIndex: 'end_date',
            key: 'end_date',
            width: '20%'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: '15%'
        },
        {
            title: 'Actions',
            dataIndex: 'actions',
            key: 'actions',
            align: 'center',
            width: '25%'
        }
    ];

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconCalendar size={24} />
                        Academic Year Management
                    </Box>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<IconPlus size={18} />}
                        onClick={handleStartAdd}
                        disabled={addingNew || editingId !== null}
                    >
                        Add New
                    </Button>
                </DialogTitle>
                <Divider />
                <DialogContent>
                    <Table
                        columns={columns}
                        dataSource={dataSource}
                        pagination={false}
                        loading={loading}
                        size="middle"
                        bordered
                        locale={{
                            emptyText: (
                                <Box sx={{ py: 3 }}>
                                    <Typography variant="body2" color="textSecondary">
                                        No academic years found. Click "Add New" to create one.
                                    </Typography>
                                </Box>
                            )
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={onClose} variant="outlined">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default AcademicYearManagement;
