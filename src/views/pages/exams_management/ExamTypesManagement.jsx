import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
    Box,
    Button,
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
    ListItemIcon,
    ListItemText,
    Menu, MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    IconArrowLeft,
    IconCalendarEvent,
    IconDotsVertical,
    IconEdit,
    IconPlus, IconSearch,
    IconTrash
} from '@tabler/icons-react';
import { Table } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { EXAM_API_BASE_URL } from '../../../ApiConstants';
import HeaderCard from '../../../ui-component/cards/HeaderCard';
import MainCard from '../../../ui-component/cards/MainCard';
import EduSphereLoader from '../../../ui-component/EduSphereLoader';
import customAxios from '../../../utils/axiosConfig';

const ExamTypesManagement = () => {
    const navigate = useNavigate();
    const { loggedUser } = useSelector((state) => state.globalState || {});
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State management
    const [examTypes, setExamTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        exam_name: '',
        exam_code: '',
        exam_category: 'Formative',
        sequence_order: 1,
    });

    // Menu state
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentExam, setCurrentExam] = useState(null);
    const openMenu = Boolean(anchorEl);

    useEffect(() => {
        fetchExamTypes();
    }, []);

    // Fetch all exam types
    const fetchExamTypes = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                `${EXAM_API_BASE_URL}/fetch/exam-types/${loggedUser?.skid}`
            );

            if (response.data.code === 200) {
                setExamTypes(response.data.data || []);
            } else {
                toast.error('Failed to fetch exam types');
            }
        } catch (error) {
            console.error('Error fetching exam types:', error);
            toast.error('Failed to fetch exam types');
        } finally {
            setLoading(false);
        }
    };

    // Handle dialog open for create
    const handleOpenCreateDialog = () => {
        setIsEditMode(false);
        setFormData({
            exam_name: '',
            exam_code: '',
            exam_category: 'Formative',
            sequence_order: examTypes.length + 1,
            is_active: true
        });
        setOpenDialog(true);
    };

    // Handle dialog open for edit
    const handleOpenEditDialog = (exam) => {
        setIsEditMode(true);
        setSelectedExam(exam);
        setFormData({
            exam_name: exam.exam_name,
            exam_code: exam.exam_code,
            exam_category: exam.exam_category,
            sequence_order: exam.sequence_order,
            is_active: exam.is_active
        });
        setOpenDialog(true);
        handleMenuClose();
    };

    // Handle form input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle create/update exam type
    const handleSubmit = async () => {
        // Validation
        if (!formData.exam_name.trim()) {
            toast.warning('Exam name is required');
            return;
        }
        if (!formData.exam_code.trim()) {
            toast.warning('Exam code is required');
            return;
        }

        try {
            setLoading(true);

            if (isEditMode) {
                // Update existing exam type
                const response = await customAxios.put(
                    `${EXAM_API_BASE_URL}/update/exam-type/${loggedUser?.skid}/${selectedExam.id}`,
                    formData
                );

                if (response.data.code === 200 && response.data.status === 'success') {
                    toast.success(response.data.message || 'Exam type updated successfully');
                    fetchExamTypes();
                    setOpenDialog(false);
                } else {
                    toast.error(response.data.message || 'Failed to update exam type');
                }
            } else {
                // Create new exam type
                const response = await customAxios.post(
                    `${EXAM_API_BASE_URL}/create/exam-type/${loggedUser?.skid}`,
                    formData
                );

                if (response.data.code === 200 && response.data.status === 'success') {
                    toast.success(response.data.message || 'Exam type created successfully');
                    fetchExamTypes();
                    setOpenDialog(false);
                } else {
                    toast.error(response.data.message || 'Failed to create exam type');
                }
            }
        } catch (error) {
            console.error('Error submitting exam type:', error);
            toast.error('Failed to save exam type');
        } finally {
            setLoading(false);
        }
    };

    // Handle delete
    const handleDeleteClick = (exam) => {
        setSelectedExam(exam);
        setOpenDeleteDialog(true);
        handleMenuClose();
    };

    const confirmDelete = async () => {
        try {
            setLoading(true);
            const response = await customAxios.delete(
                `${EXAM_API_BASE_URL}/delete/exam-type/${loggedUser?.skid}/${selectedExam.id}`
            );

            if (response.data.code === 200 && response.data.status === 'success') {
                toast.success(response.data.message || 'Exam type deleted successfully');
                fetchExamTypes();
                setOpenDeleteDialog(false);
            } else {
                toast.error(response.data.message || 'Failed to delete exam type');
            }
        } catch (error) {
            console.error('Error deleting exam type:', error);
            toast.error('Failed to delete exam type. It may be in use.');
        } finally {
            setLoading(false);
        }
    };

    // Menu handlers
    const handleMenuClick = (event, exam) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setCurrentExam(exam);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setCurrentExam(null);
    };

    // Filter exams based on search
    const filteredExams = examTypes.filter(exam =>
        exam.exam_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.exam_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.exam_category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Table columns
    const columns = [
        {
            title: 'Order',
            dataIndex: 'sequence_order',
            key: 'sequence_order',
            // width: 80,
            align: 'center',
            sorter: (a, b) => a.sequence_order - b.sequence_order,
            render: (order) => (
                <Chip
                    label={order}
                    size="small"
                    color="primary"
                    variant="outlined"
                />
            ),
        },
        {
            title: 'Exam Name',
            dataIndex: 'exam_name',
            key: 'exam_name',
            sorter: (a, b) => a.exam_name.localeCompare(b.exam_name),
            render: (text, record) => (
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {text}
                </Typography>
            ),
        },
        {
            title: 'Code',
            dataIndex: 'exam_code',
            key: 'exam_code',
            // width: 120,
            render: (code) => (
                <Chip label={code} size="small" color="secondary" />
            ),
        },
        {
            title: 'Category',
            dataIndex: 'exam_category',
            key: 'exam_category',
            // width: 150,
            filters: [
                { text: 'Formative', value: 'Formative' },
                { text: 'Summative', value: 'Summative' },
                { text: 'Annual', value: 'Annual' },
            ],
            onFilter: (value, record) => record.exam_category === value,
            render: (category) => {
                const colorMap = {
                    'Formative': 'primary',
                    'Summative': 'success',
                    'Annual': 'warning'
                };
                return (
                    <Chip
                        label={category}
                        size="small"
                        color={colorMap[category] || 'default'}
                    />
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            // width: 80,
            align: 'center',
            render: (_, record) => (
                <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, record)}
                >
                    <IconDotsVertical size={18} />
                </IconButton>
            ),
        },
    ];

    const breadcrumbLinks = [
        { title: 'Dashboard', to: '/dashboard' },
        { title: 'Exam Subject Configuration', to: '/exams/subjects' },
        { title: 'Exam Types management', to: '/exams/types' },
    ];

    return (
        <>
            <EduSphereLoader loading={loading} />
            <HeaderCard
                heading={'Exam Subject Configuration'}
                breadcrumbLinks={breadcrumbLinks}
                buttonColor={'primary'}
                buttonvariant={'variant'}
                onButtonClick={() => navigate(-1)}
                buttonIcon={<IconArrowLeft color='white' />}
            />

            <MainCard
                title={
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: { xs: 1, sm: 1.5 },
                            flexWrap: 'wrap',
                            mb: { xs: 1, sm: 0 }
                        }}
                    >
                        <IconCalendarEvent size={isMobile ? 20 : 24} />
                        <Typography variant="h4" sx={{ fontSize: { xs: '1.125rem', sm: '1.5rem' } }}>
                            Create and manage exam types for your school
                        </Typography>
                    </Box>
                }
                secondary={
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 1, sm: 2 }}
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                        sx={{ width: '100%' }}
                    >
                        <TextField
                            placeholder={isMobile ? "Search..." : "Search exams..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconSearch size={isMobile ? 16 : 18} />
                                        </InputAdornment>
                                    )
                                }
                            }}
                            size="small"
                            sx={{
                                width: { xs: '100%', sm: 250 },
                                '& .MuiInputBase-root': {
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                }
                            }}
                        />
                        <Button
                            variant="contained"
                            startIcon={<IconPlus size={isMobile ? 16 : 20} />}
                            onClick={handleOpenCreateDialog}
                            size={isMobile ? "small" : "medium"}
                            sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                padding: { xs: '6px 12px', sm: '8px 16px' }
                            }}
                        >
                            {isMobile ? 'Create' : 'Create Exam Type'}
                        </Button>
                    </Stack>
                }
            >
                <Table
                    columns={columns}
                    dataSource={filteredExams}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} exam types`,
                    }}
                    size="small"
                    loading={loading}
                    scroll={{ x: 680, y: 400 }}
                />
            </MainCard>

            {/* Actions Menu */}
            <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={() => handleOpenEditDialog(currentExam)}>
                    <ListItemIcon><IconEdit size={18} /></ListItemIcon>
                    <ListItemText
                        primary="Edit"
                        slotProps={{ primary: { sx: { fontSize: { xs: '0.875rem', sm: '1rem' } } } }}
                    />
                </MenuItem>
                <MenuItem onClick={() => handleDeleteClick(currentExam)}>
                    <ListItemIcon>  <IconTrash size={18} color="red" /></ListItemIcon>
                    <ListItemText
                        primary="Delete"
                        slotProps={{
                            primary: {
                                sx: { fontSize: { xs: '0.875rem', sm: '1rem' }, color: 'error.main' }
                            }
                        }}
                    />
                </MenuItem>
            </Menu>

            {/* Create/Edit Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {isEditMode ? 'Edit Exam Type' : 'Create New Exam Type'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Exam Name"
                                    placeholder="e.g., First Term Examination"
                                    value={formData.exam_name}
                                    onChange={(e) => handleInputChange('exam_name', e.target.value)}
                                    required
                                    autoFocus
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Exam Code"
                                    placeholder="e.g., FTE or FA1"
                                    value={formData.exam_code}
                                    onChange={(e) => handleInputChange('exam_code', e.target.value.toUpperCase())}
                                    required
                                    inputProps={{ maxLength: 20 }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        value={formData.exam_category}
                                        onChange={(e) => handleInputChange('exam_category', e.target.value)}
                                        label="Category"
                                    >
                                        <MenuItem value="Formative">Formative Assessment</MenuItem>
                                        <MenuItem value="Summative">Summative Exam</MenuItem>
                                        <MenuItem value="Annual">Annual Exam</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Sequence Order"
                                    type="number"
                                    value={formData.sequence_order}
                                    onChange={(e) => handleInputChange('sequence_order', parseInt(e.target.value) || 1)}
                                    InputProps={{ inputProps: { min: 1 } }}
                                    helperText="Display order in lists"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Paper sx={{ p: 2, bgcolor: 'info.lighter' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        💡 <strong>Tip:</strong> Exam codes should be unique and easy to identify.
                                        Use categories to organize your exam types effectively.
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenDialog(false)} variant="outlined" disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                        {isEditMode ? 'Update' : 'Create'} Exam Type
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <WarningAmberIcon color="error" />
                        <span>Delete Exam Type</span>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>"{selectedExam?.exam_name}"</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        ⚠️ This will also delete all associated exam configurations and marks entries.
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={confirmDelete} variant="contained" color="error" disabled={loading}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ExamTypesManagement;
