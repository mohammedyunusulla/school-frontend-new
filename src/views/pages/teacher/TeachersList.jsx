import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
    Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
    Grid, IconButton, ListItemIcon, ListItemText, Menu, MenuItem,
    Divider as MuiDivider, Tooltip, Typography, Accordion, AccordionSummary,
    AccordionDetails, Stack, useTheme, useMediaQuery
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IconEdit, IconEyeShare, IconTrash, IconUser, IconX, IconPhone, IconMail, IconBriefcase, IconCalendar } from '@tabler/icons-react';
import { Table } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { TEACHERS_API_BASE_URL } from '../../../ApiConstants';
import EduSphereLoader from '../../../ui-component/EduSphereLoader';
import customAxios from '../../../utils/axiosConfig';
import { toast } from 'react-toastify';

const TeachersList = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { loggedUser } = useSelector((state) => state.globalState || {});
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuRowData, setMenuRowData] = useState(null);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [expandedAccordion, setExpandedAccordion] = useState(false);

    const columns = [
        {
            title: 'Name',
            dataIndex: 'full_name',
            key: 'name',
            sorter: (a, b) => a.full_name.localeCompare(b.full_name)
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Phone Number',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone) => phone || 'N/A'
        },
        {
            title: 'Employee ID',
            dataIndex: ['profile', 'employee_id'],
            key: 'employee_id',
            render: (id) => id || 'N/A'
        },
        {
            title: 'Qualifications',
            dataIndex: ['profile', 'qualifications'],
            key: 'qualifications',
            render: (qual) => qual || 'N/A'
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (is_active) => (
                <Chip
                    label={is_active ? 'Active' : 'Inactive'}
                    color={is_active ? 'primary' : 'error'}
                    size="small"
                />
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Tooltip title="More actions">
                    <IconButton onClick={(event) => handleMenuOpen(event, record)}>
                        <MoreVertIcon />
                    </IconButton>
                </Tooltip>
            )
        },
    ];

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const response = await customAxios.get(`${TEACHERS_API_BASE_URL}/list/${loggedUser?.skid}`);
            if (response.data.code === 200 && response.data.status === 'success') {
                setTeachers(response.data.teachers);
            }
        } catch (err) {
            console.error('Error fetching teachers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewTeacherDialog = (record) => {
        setSelectedTeacher(record);
        setOpenViewDialog(true);
        handleMenuClose();
    };

    const handleMenuOpen = (event, row) => {
        setMenuAnchorEl(event.currentTarget);
        setMenuRowData(row);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setMenuRowData(null);
    };

    const handleEditTeacher = (record) => {
        navigate(`/teacher/update`, { state: { user: record, mode: 'update' } });
        handleMenuClose();
    };

    const handleDeleteTeacher = (record) => {
        setSelectedTeacher(record);
        setOpenDeleteDialog(true);
        handleMenuClose();
    };

    const confirmDeleteTeacher = async () => {
        try {
            setLoading(true);
            const response = await customAxios.delete(
                `${TEACHERS_API_BASE_URL}/delete/${loggedUser?.skid}/${selectedTeacher.id}`
            );
            if (response?.data?.code === 200 && response?.data?.status === 'success') {
                toast.success(response.data.message || "Teacher deleted successfully!");
                fetchTeachers();
            }
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error('Error deleting teacher:', error);
            toast.error('Failed to delete teacher');
        } finally {
            setLoading(false);
        }
    };

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpandedAccordion(isExpanded ? panel : false);
    };

    // Mobile Accordion View Component
    const TeacherAccordion = ({ teacher }) => (
        <Accordion
            expanded={expandedAccordion === teacher.id}
            onChange={handleAccordionChange(teacher.id)}
            sx={{
                mb: 1.5,
                '&:before': { display: 'none' },
                // borderLeft: '4px solid',
                // borderLeftColor: teacher.is_active ? 'primary.main' : 'error.main',
                boxShadow: expandedAccordion === teacher.id ? 3 : 1,
                borderRadius: '8px !important',
                '&:first-of-type': {
                    borderRadius: '8px !important'
                },
                '&:last-of-type': {
                    borderRadius: '8px !important'
                }
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                    '& .MuiAccordionSummary-content': {
                        my: 1.5,
                        alignItems: 'center'
                    },
                    '&:hover': {
                        bgcolor: 'action.hover'
                    }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {teacher.full_name}
                        </Typography>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: '0.75rem' }}
                        >
                            {teacher.profile?.employee_id || teacher.username}
                        </Typography>
                    </Box>
                    <Chip
                        label={teacher.is_active ? 'Active' : 'Inactive'}
                        color={teacher.is_active ? 'success' : 'error'}
                        size="small"
                        sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            fontWeight: 600
                        }}
                    />
                </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 0, pb: 2, px: 2 }}>
                {/* Contact Information */}
                <Stack spacing={1.5} sx={{ mb: 2 }}>
                    {teacher.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                                bgcolor: 'primary.lighter',
                                p: 0.8,
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <IconMail size={18} color={theme.palette.primary.main} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                    Email
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontSize: '0.85rem',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {teacher.email}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {teacher.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                                bgcolor: 'success.lighter',
                                p: 0.8,
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <IconPhone size={18} color={theme.palette.success.main} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                    Phone Number
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                    {teacher.phone}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {teacher.profile?.qualifications && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                                bgcolor: 'warning.lighter',
                                p: 0.8,
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <IconBriefcase size={18} color={theme.palette.warning.main} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                    Qualifications
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                    {teacher.profile.qualifications}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {teacher.profile?.date_of_joining && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                                bgcolor: 'info.lighter',
                                p: 0.8,
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <IconCalendar size={18} color={theme.palette.info.main} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                    Joining Date
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                    {new Date(teacher.profile.date_of_joining).toLocaleDateString('en-IN')}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Stack>

                <MuiDivider sx={{ my: 2 }} />

                {/* Action Buttons */}
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        startIcon={<IconEyeShare size={16} />}
                        onClick={() => handleViewTeacherDialog(teacher)}
                        sx={{ fontSize: '0.75rem', py: 1 }}
                    >
                        View Details
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        startIcon={<IconEdit size={16} />}
                        onClick={() => handleEditTeacher(teacher)}
                        sx={{ fontSize: '0.75rem', py: 1 }}
                    >
                        Edit
                    </Button>
                    <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteTeacher(teacher)}
                        sx={{
                            minWidth: 40,
                            border: '1px solid',
                            borderColor: 'error.main',
                            borderRadius: 1
                        }}
                    >
                        <IconTrash size={18} />
                    </IconButton>
                </Stack>
            </AccordionDetails>
        </Accordion>
    );

    return (
        <Box sx={{ p: { xs: 0, sm: 2 } }}>
            <EduSphereLoader loading={loading} />

            {/* Desktop Table View */}
            {!isMobile ? (
                <Table
                    dataSource={teachers}
                    columns={columns}
                    rowKey="id"
                    bordered
                    size='small'
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 680, y: 400 }}
                    locale={{ emptyText: 'No teachers found' }}
                />
            ) : (
                /* Mobile Accordion View */
                <Box sx={{ px: 0 }}>

                    {/* Accordions */}
                    {teachers.map((teacher) => (
                        <TeacherAccordion key={teacher.id} teacher={teacher} />
                    ))}

                    {teachers.length === 0 && (
                        <Box sx={{
                            textAlign: 'center',
                            py: 6,
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            border: '1px dashed',
                            borderColor: 'divider'
                        }}>
                            <Typography variant="body2" color="text.secondary">
                                No teachers found
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}

            {/* Actions Menu - Desktop Only */}
            {!isMobile && (
                <Menu
                    anchorEl={menuAnchorEl}
                    open={Boolean(menuAnchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <MenuItem onClick={() => handleViewTeacherDialog(menuRowData)}>
                        <ListItemIcon><IconEyeShare fontSize="medium" /></ListItemIcon>
                        <ListItemText
                            primary="View Teacher"
                            slotProps={{ primary: { sx: { fontSize: { xs: '0.875rem', sm: '1rem' } } } }}
                        />
                    </MenuItem>
                    <MuiDivider />
                    <MenuItem onClick={() => handleEditTeacher(menuRowData)}>
                        <ListItemIcon><IconEdit fontSize="medium" /></ListItemIcon><ListItemText
                            primary="Edit Teacher"
                            slotProps={{ primary: { sx: { fontSize: { xs: '0.875rem', sm: '1rem' } } } }}
                        />
                    </MenuItem>
                    <MuiDivider />
                    <MenuItem onClick={() => handleDeleteTeacher(menuRowData)} sx={{ color: 'red' }}>
                        <ListItemIcon><IconTrash fontSize="medium" /></ListItemIcon>
                        <ListItemText
                            primary="Delete Teacher"
                            slotProps={{ primary: { sx: { fontSize: { xs: '0.875rem', sm: '1rem' } } } }}
                        />
                    </MenuItem>
                </Menu>
            )}

            {/* View Teacher Dialog */}
            <Dialog
                open={openViewDialog}
                onClose={() => setOpenViewDialog(false)}
                maxWidth="md"
                fullWidth
            // fullScreen={isMobile}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pb: 1
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconUser size={isMobile ? 20 : 24} />
                        <Typography variant={isMobile ? "h6" : "h5"}>Teacher Details</Typography>
                    </Box>
                    <IconButton onClick={() => setOpenViewDialog(false)} size="small">
                        <IconX size={isMobile ? 20 : 24} />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
                    {selectedTeacher && (
                        <Box>
                            {/* Header with Avatar and Status */}
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: { xs: 2, sm: 3 },
                                mb: 3,
                                flexDirection: { xs: 'column', sm: 'row' },
                                textAlign: { xs: 'center', sm: 'left' }
                            }}>
                                <Avatar
                                    sx={{
                                        width: { xs: 60, sm: 80 },
                                        height: { xs: 60, sm: 80 },
                                        bgcolor: 'primary.main',
                                        fontSize: { xs: '1.5rem', sm: '2rem' }
                                    }}
                                >
                                    {selectedTeacher.first_name?.[0]?.toUpperCase()}
                                    {selectedTeacher.last_name?.[0]?.toUpperCase()}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant={isMobile ? "h5" : "h4"}>
                                        {selectedTeacher.full_name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {selectedTeacher.username}
                                    </Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <Chip
                                            label={selectedTeacher.is_active ? 'Active' : 'Inactive'}
                                            color={selectedTeacher.is_active ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </Box>
                                </Box>
                            </Box>

                            <MuiDivider sx={{ my: 2 }} />

                            {/* Basic Information */}
                            <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                Basic Information
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Email</Typography>
                                    <Typography variant="body2">{selectedTeacher.email || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                                    <Typography variant="body2">{selectedTeacher.phone || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                                    <Typography variant="body2">{selectedTeacher.date_of_birth || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Gender</Typography>
                                    <Typography variant="body2">{selectedTeacher.gender || 'N/A'}</Typography>
                                </Grid>
                            </Grid>

                            <MuiDivider sx={{ my: 2 }} />

                            {/* Professional Information */}
                            <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                Professional Information
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Employee ID</Typography>
                                    <Typography variant="body2">{selectedTeacher.profile?.employee_id || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Qualifications</Typography>
                                    <Typography variant="body2">{selectedTeacher.profile?.qualifications || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Joining Date</Typography>
                                    <Typography variant="body2">{selectedTeacher.profile?.date_of_joining || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">Address</Typography>
                                    <Typography variant="body2">{selectedTeacher.address || 'N/A'}</Typography>
                                </Grid>
                            </Grid>

                            {/* Subjects Taught */}
                            {selectedTeacher.subjects && selectedTeacher.subjects.length > 0 && (
                                <>
                                    <MuiDivider sx={{ my: 2 }} />
                                    <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                        Subjects Taught
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {selectedTeacher.subjects.map((subject, index) => (
                                            <Chip
                                                key={index}
                                                label={subject.subject_name}
                                                variant="outlined"
                                                color="primary"
                                                size={isMobile ? "small" : "medium"}
                                            />
                                        ))}
                                    </Box>
                                </>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{
                    px: { xs: 2, sm: 3 },
                    py: 2,
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 }
                }}>
                    <Button
                        onClick={() => setOpenViewDialog(false)}
                        variant="outlined"
                        size="small"
                        fullWidth={isMobile}
                    >
                        Close
                    </Button>
                    <Button
                        onClick={() => {
                            setOpenViewDialog(false);
                            handleEditTeacher(selectedTeacher);
                        }}
                        variant="contained"
                        size="small"
                        startIcon={<IconEdit size={16} />}
                        fullWidth={isMobile}
                    >
                        Edit Teacher
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
            // fullScreen={isMobile}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                }}>
                    <IconTrash size={isMobile ? 20 : 24} />
                    Delete Teacher
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        Are you sure you want to delete "{selectedTeacher?.full_name}"?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions >
                    <Button
                        onClick={() => setOpenDeleteDialog(false)}
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDeleteTeacher}
                        variant="contained"
                        color="error"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TeachersList;
