import MoreVertIcon from '@mui/icons-material/MoreVert';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider, FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    ListItemIcon, ListItemText,
    Menu, MenuItem,
    Select,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material';
import {
    IconArrowLeft,
    IconEdit,
    IconEyeShare,
    IconPlus,
    IconSearch, IconSwitchHorizontal,
    IconTrash, IconTrendingUp, IconUserMinus
} from '@tabler/icons-react';
import { Table } from 'antd';
import React, { Suspense, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CLASSES_API_BASE_URL, STUDENTS_API_BASE_URL } from '../../../ApiConstants';
import MainCard from '../../../ui-component/cards/MainCard';
import EduSphereLoader from '../../../ui-component/EduSphereLoader';
import customAxios from '../../../utils/axiosConfig';

const AddStudentsToSections = React.lazy(() => import('./AddStudentsToSections'));
const StudentDetailsDialog = React.lazy(() => import('../student/StudentDetailsDialog'));
const PromoteStudents = React.lazy(() => import('../components/PromoteStudents'));


function SectionStudents() {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const { loggedUser, academicYear } = useSelector(state => ({
        loggedUser: state.globalState?.loggedUser || null,
        academicYear: state.globalState?.academicYear || null
    }));

    const [students, setStudents] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [viewStudentDetailsDialog, setViewStudentDetailsDialog] = useState(false);
    const [openAddStudentModal, setOpenAddStudentModal] = useState(false);
    const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openMoveDialog, setOpenMoveDialog] = useState(false);
    const [targetSectionId, setTargetSectionId] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentStudent, setCurrentStudent] = useState(null);
    const openMenu = Boolean(anchorEl);
    const { section, class: classData } = location.state || {};
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [openPromoteDialog, setOpenPromoteDialog] = useState(false);


    useEffect(() => {
        fetchSectionStudents();
        fetchAvailableSections();
    }, [params?.sectionId, academicYear]);

    const fetchSectionStudents = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                `${STUDENTS_API_BASE_URL}/list/inSection/${loggedUser?.skid}/${academicYear?.id}/${params?.sectionId}`
            );
            if (response.data.code === 200) {
                setStudents(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableSections = async () => {
        try {
            const response = await customAxios.get(
                `${CLASSES_API_BASE_URL}/sections/${loggedUser?.skid}/${classData?.id}`
            );
            if (response.data.code === 200) {
                // Filter out current section
                const otherSections = (response.data.data || []).filter(
                    s => s.id !== parseInt(params?.sectionId)
                );
                setSections(otherSections);
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    const handleViewStudentDialog = async (record) => {
        try {
            setLoading(true);
            const response = await customAxios.get(STUDENTS_API_BASE_URL + '/get-by-id/' + loggedUser?.skid + '/' + record.id);
            if (response.data.code === 200 && response.data.status === 'success') {
                setSelectedStudent(response.data.student);
                setViewStudentDetailsDialog(true);
            }
        } catch (error) {
            console.error('Error fetching student:', error);
            toast.error('Error fetching student');
        } finally {
            setLoading(false);
        }
    };

    const handleEditStudent = (student) => {
        handleMenuClose();
        navigate(`/student/update/${student.id}`, { state: { user: student, mode: 'update' } });
    };

    const handleMoveStudent = (student) => {
        setSelectedStudent(student);
        setTargetSectionId('');
        setOpenMoveDialog(true);
        handleMenuClose();
    };

    const handleRemoveStudent = (student) => {
        setSelectedStudent(student);
        setOpenRemoveDialog(true);
        handleMenuClose();
    };

    const handleDeleteStudent = (student) => {
        setSelectedStudent(student);
        setOpenDeleteDialog(true);
        handleMenuClose();
    };

    const confirmRemoveStudent = async () => {
        try {
            setLoading(true);
            const resp = await customAxios.delete(
                `${CLASSES_API_BASE_URL}/remove-from-section/${loggedUser?.skid}/${params?.sectionId}/${selectedStudent.id}`
            );
            if (resp.data.code === 200 && resp.data.status === 'success') {
                toast.success(resp.data.message);
                fetchSectionStudents();
            } else {
                toast.error(resp.data.message || 'Failed to remove student from section');
            }
            setOpenRemoveDialog(false);
        } catch (error) {
            console.error('Error removing student:', error);
            toast.error('Failed to remove student from section');
        } finally {
            setLoading(false);
        }
    };

    const confirmDeleteStudent = async () => {
        try {
            setLoading(true);
            const resp = await customAxios.delete(
                `${STUDENTS_API_BASE_URL}/delete/${loggedUser?.skid}/${selectedStudent.id}`
            );
            if (resp.data.code === 200 && resp.data.status === 'success') {
                toast.success('Student deleted successfully');
                fetchSectionStudents();
            } else {
                toast.error(resp.data.message || 'Failed to delete student');
            }
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error('Error deleting student:', error);
            toast.error('Failed to delete student');
        } finally {
            setLoading(false);
        }
    };

    const confirmMoveStudent = async () => {
        if (!targetSectionId) {
            toast.warning('Please select a target section');
            return;
        }

        try {
            setLoading(true);
            const resp = await customAxios.put(
                `${CLASSES_API_BASE_URL}/move-to-section/${loggedUser?.skid}/${targetSectionId}/${selectedStudent.id}`
            );

            if (resp.data.code === 200 && resp.data.status === 'success') {
                toast.success(resp.data.message || 'Student moved successfully');
                fetchSectionStudents();
                setOpenMoveDialog(false);
            } else {
                toast.error(resp.data.message || 'Failed to move student');
            }
        } catch (error) {
            console.error('Error moving student:', error);
            toast.error('Failed to move student to another section');
        } finally {
            setLoading(false);
        }
    };

    const handleMenuClick = (event, student) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setCurrentStudent(student);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setCurrentStudent(null);
    };

    const filteredStudents = students.filter(student =>
        student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys)
    };

    const columns = [
        {
            title: 'Student',
            key: 'student',
            render: (_, record) => (
                <Typography variant="subtitle1" fontWeight={500}>
                    {record.full_name}
                </Typography>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone) => phone || 'N/A',
        },
        {
            title: 'Status',
            dataIndex: 'enrollment_status',
            key: 'status',
            render: (enrollment_status) => (
                <Chip
                    label={enrollment_status}
                    color={(enrollment_status === 'PASSED') ? 'primary' : 'default'}
                    size="small"
                />
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <Tooltip title="More actions">
                    <IconButton onClick={(e) => handleMenuClick(e, record)}>
                        <MoreVertIcon />
                    </IconButton>
                </Tooltip>
            ),
        },
    ];

    return (
        <>
            <EduSphereLoader loading={loading} />
            <MainCard
                title={
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 1, sm: 2 },
                        flexWrap: 'wrap'
                    }}>
                        <IconButton
                            onClick={() => navigate(-1)}
                            size="small"
                            sx={{
                                flexShrink: 0,
                                width: { xs: 30, sm: 40 },
                                height: { xs: 32, sm: 40 }
                            }}
                        >
                            <IconArrowLeft size={window.innerWidth < 600 ? 18 : 24} />
                        </IconButton>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontSize: { xs: '1rem', sm: '1.25rem' },
                                    fontWeight: { xs: 600, sm: 700 },
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: { xs: 'nowrap', sm: 'normal' }
                                }}
                            >
                                {classData?.class_name} - {section?.section_name}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                    display: { xs: 'none', sm: 'block' }
                                }}
                            >
                                Managing students for this section
                            </Typography>
                        </Box>
                    </Box>
                }
                secondary={
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<IconPlus size={window.innerWidth < 600 ? 16 : 18} />}
                        onClick={() => setOpenAddStudentModal(true)}
                        sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            padding: { xs: '4px 8px', sm: '6px 16px' },
                            minWidth: { xs: 'auto', sm: '120px' },
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                            Add Students
                        </Box>
                        <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                            Add
                        </Box>
                    </Button>
                }
            >
                <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item size={{ xl: 4, lg: 4, md: 8, sm: 8, xs: 12 }}>
                            <TextField
                                fullWidth
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconSearch size={20} />
                                        </InputAdornment>
                                    ),
                                }}
                                size="small"
                            />
                        </Grid>
                        <Grid item size={{ xl: 3, lg: 3, md: 3, sm: 4, xs: 12 }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                size="small"
                                disabled={selectedRowKeys.length === 0}
                                startIcon={<IconTrendingUp size={window.innerWidth < 600 ? 16 : 18} />}
                                onClick={() => setOpenPromoteDialog(true)}
                                sx={{
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    padding: { xs: '4px 8px', sm: '6px 16px' }
                                }}
                            >
                                Promote ({selectedRowKeys.length})
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                <Table
                    columns={columns}
                    dataSource={filteredStudents}
                    rowKey="id"
                    rowSelection={rowSelection}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} students`,
                    }}
                    size='small'
                    onRow={(record) => {
                        return {
                            onClick: (e) => {
                                // Only trigger view on cell clicks, not checkbox
                                if (e.target.closest('.ant-table-selection-column')) return;
                                handleViewStudentDialog(record);
                            }
                        };
                    }}
                    scroll={{ x: 680, y: 400 }}
                />
            </MainCard>

            {/* Add Students Modal Component */}
            <Suspense fallback={<CircularProgress />}>
                <AddStudentsToSections
                    open={openAddStudentModal}
                    onClose={() => setOpenAddStudentModal(false)}
                    sectionId={params?.sectionId}
                    sectionName={section?.section_name}
                    classId={classData?.id}
                    skid={loggedUser?.skid}
                    academicYear={academicYear}
                    currentStudentIds={students.map(s => s.id)}
                    onStudentsAdded={fetchSectionStudents}
                />
            </Suspense>

            {/* Promote Students Component */}
            <Suspense fallback={<CircularProgress />}>
                <PromoteStudents
                    loggedUser={loggedUser}
                    open={openPromoteDialog}
                    onClose={() => setOpenPromoteDialog(false)}
                    selectedStudents={students.filter((s) => selectedRowKeys.includes(s.id))}
                    currentClass={classData}
                    currentSection={section}
                    currentAcademicYear={academicYear}
                    onPromotionSuccess={() => { // Callback
                        fetchSectionStudents();
                        setSelectedRowKeys([]);
                    }}
                />
            </Suspense>

            <StudentDetailsDialog
                open={viewStudentDetailsDialog}
                onClose={() => setViewStudentDetailsDialog(false)}
                student={selectedStudent}
                onEdit={handleEditStudent}
            />

            {/* Material-UI Menu for Actions */}
            <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: {
                        minWidth: 200,
                        boxShadow: theme.shadows[8],
                        borderRadius: 2,
                        mt: 0.5
                    }
                }}
            >
                <MenuItem onClick={() => { handleViewStudentDialog(currentStudent); handleMenuClose(); }}>
                    <ListItemIcon><IconEyeShare fontSize="medium" /></ListItemIcon>
                    <ListItemText
                        primary="View Student"
                        slotProps={{ primary: { sx: { fontSize: { xs: '0.875rem', sm: '1rem' } } } }}
                    />
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => handleEditStudent(currentStudent)}>
                    <ListItemIcon><IconEdit fontSize="medium" /></ListItemIcon>
                    <ListItemText
                        primary="Edit Student"
                        slotProps={{ primary: { sx: { fontSize: { xs: '0.875rem', sm: '1rem' } } } }}
                    />
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem onClick={() => handleMoveStudent(currentStudent)}>
                    <ListItemIcon><IconSwitchHorizontal fontSize="medium" /></ListItemIcon>
                    <ListItemText
                        primary="Move to Another Section"
                        slotProps={{ primary: { sx: { fontSize: { xs: '0.875rem', sm: '1rem' } } } }}
                    />
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem onClick={() => handleRemoveStudent(currentStudent)}>
                    <ListItemIcon><IconUserMinus fontSize="medium" /></ListItemIcon>
                    <ListItemText
                        primary="Remove from Section"
                        slotProps={{ primary: { sx: { fontSize: { xs: '0.875rem', sm: '1rem' } } } }}
                    />
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem
                    onClick={() => handleDeleteStudent(currentStudent)}
                    sx={{ color: 'error.main' }}
                >
                    <ListItemIcon>
                        <IconTrash fontSize="medium" color={theme.palette.error.main} />
                    </ListItemIcon>
                    <ListItemText
                        primary="Delete Student"
                        slotProps={{ primary: { sx: { fontSize: { xs: '0.875rem', sm: '1rem' } } } }}
                    />
                </MenuItem>
            </Menu>

            {/* Move Student Dialog */}
            <Dialog open={openMoveDialog} onClose={() => setOpenMoveDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconSwitchHorizontal size={24} />
                    Move Student to Another Section
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Moving <strong>{selectedStudent?.full_name}</strong> from{' '}
                            <Chip label={section?.section_name} size="small" color="primary" />
                        </Typography>

                        <FormControl fullWidth>
                            <InputLabel id="target-section-label">Select Target Section</InputLabel>
                            <Select
                                labelId="target-section-label"
                                value={targetSectionId}
                                label="Select Target Section"
                                onChange={(e) => setTargetSectionId(e.target.value)}
                            >
                                {sections.length === 0 ? (
                                    <MenuItem disabled>No other sections available</MenuItem>
                                ) : (
                                    sections.map((sec) => (
                                        <MenuItem key={sec.id} value={sec.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography>{sec.section_name}</Typography>
                                                <Chip
                                                    label={`${sec.student_count || 0} students`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Box>
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>

                        {targetSectionId && (
                            <Box sx={{
                                mt: 2,
                                p: 2,
                                bgcolor: 'info.lighter',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'info.light'
                            }}>
                                <Typography variant="caption" color="info.dark">
                                    ℹ️ The student will be moved to{' '}
                                    <strong>
                                        {sections.find(s => s.id === targetSectionId)?.section_name}
                                    </strong>
                                    . This action will update their enrollment immediately.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenMoveDialog(false)} variant="outlined">
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmMoveStudent}
                        variant="contained"
                        color="primary"
                        disabled={!targetSectionId || loading}
                        startIcon={<IconSwitchHorizontal size={18} />}
                    >
                        Move Student
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Remove Student Dialog */}
            <Dialog open={openRemoveDialog} onClose={() => setOpenRemoveDialog(false)}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmberIcon color="warning" />
                    Remove Student
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to remove "{selectedStudent?.full_name}" from this section?
                        The student will not be deleted but will be unassigned from this section.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRemoveDialog(false)} variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={confirmRemoveStudent} variant="contained" color="warning">
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Student Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmberIcon color="error" />
                    Delete Student
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to permanently delete "{selectedStudent?.full_name}"?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={confirmDeleteStudent} variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default SectionStudents;