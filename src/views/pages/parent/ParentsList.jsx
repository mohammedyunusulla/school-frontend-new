import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
    Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
    Grid, IconButton, ListItemIcon, ListItemText, Menu, MenuItem,
    Divider as MuiDivider, Tooltip, Typography
} from '@mui/material';
import { IconEdit, IconEyeShare, IconTrash, IconUsers, IconX } from '@tabler/icons-react';
import { Table } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { PARENTS_API_BASE_URL } from '../../../ApiConstants';
import EduSphereLoader from '../../../ui-component/EduSphereLoader';
import customAxios from '../../../utils/axiosConfig';

const ParentsList = () => {
    const navigate = useNavigate();
    const [parents, setParents] = useState([]);
    const [loading, setLoading] = useState(false);
    const { loggedUser } = useSelector((state) => state.globalState || {});
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuRowData, setMenuRowData] = useState(null);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [selectedParent, setSelectedParent] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const columns = [
        {
            title: 'Father Name',
            dataIndex: ['profile', 'father_full_name'],
            key: 'father_name',
            sorter: (a, b) => (a.profile?.father_full_name || '').localeCompare(b.profile?.father_full_name || ''),
            render: (text) => text || 'N/A'
        },
        {
            title: 'Father Phone',
            dataIndex: ['profile', 'father_phone'],
            key: 'father_phone',
            render: (text) => text || 'N/A'
        },
        {
            title: 'Mother Name',
            dataIndex: ['profile', 'mother_full_name'],
            key: 'mother_name',
            sorter: (a, b) => (a.profile?.mother_full_name || '').localeCompare(b.profile?.mother_full_name || ''),
            render: (text) => text || 'N/A'
        },
        {
            title: 'Mother Phone',
            dataIndex: ['profile', 'mother_phone'],
            key: 'mother_phone',
            render: (text) => text || 'N/A'
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text) => text || 'N/A'
        },
        {
            title: 'City',
            dataIndex: ['profile', 'city'],
            key: 'city',
            render: (text) => text || 'N/A'
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
        fetchParents();
    }, []);

    const fetchParents = async () => {
        setLoading(true);
        try {
            const response = await customAxios.get(`${PARENTS_API_BASE_URL}/list/${loggedUser?.skid}`);
            if (response.data.code === 200 && response.data.status === 'success') {
                setParents(response.data.parents);
            }
        } catch (err) {
            console.error('Error fetching parents:', err);
            toast.error('Failed to fetch parents');
        } finally {
            setLoading(false);
        }
    };

    const handleViewParentDialog = (record) => {
        setSelectedParent(record);
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

    const handleEditParent = (record) => {
        navigate(`/parent/update`, { state: { parent: record, mode: 'update' } });
        handleMenuClose();
    };

    const handleDeleteParent = (record) => {
        setSelectedParent(record);
        setOpenDeleteDialog(true);
        handleMenuClose();
    };

    const confirmDeleteParent = async () => {
        try {
            setLoading(true);
            const response = await customAxios.delete(
                `${PARENTS_API_BASE_URL}/delete/${loggedUser?.skid}/${selectedParent.id}`
            );
            if (response?.data?.code === 200 && response?.data?.status === 'success') {
                toast.success(response.data.message || "Parent deleted successfully!");
                fetchParents();
            }
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error('Error deleting parent:', error);
            toast.error(error.response?.data?.message || 'Failed to delete parent');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <EduSphereLoader loading={loading} />
            <Table
                dataSource={parents}
                columns={columns}
                rowKey="id"
                bordered
                size='small'
                pagination={{ pageSize: 10 }}
                scroll={{ x: 680, y: 400 }}
                locale={{ emptyText: 'No parents found' }}
            />

            {/* Actions Menu */}
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={() => handleViewParentDialog(menuRowData)}>
                    <ListItemIcon><IconEyeShare fontSize="medium" /></ListItemIcon>
                    <ListItemText
                        primary="View Parent"
                        slotProps={{ primary: { sx: { fontSize: { xs: '0.875rem', sm: '1rem' } } } }}
                    />
                </MenuItem>
                <MuiDivider />
                <MenuItem onClick={() => handleEditParent(menuRowData)}>
                    <ListItemIcon><IconEdit fontSize="medium" /></ListItemIcon>
                    <ListItemText
                        primary="Edit Parent"
                        slotProps={{ primary: { sx: { fontSize: { xs: '0.875rem', sm: '1rem' } } } }}
                    />
                </MenuItem>
                <MuiDivider />
                <MenuItem onClick={() => handleDeleteParent(menuRowData)} sx={{ color: 'red' }}>
                    <ListItemIcon><IconTrash fontSize="medium" color="red" /></ListItemIcon>
                    <ListItemText
                        primary="Delete Parent"
                        slotProps={{ primary: { sx: { fontSize: { xs: '0.875rem', sm: '1rem' } } } }}
                    />
                </MenuItem>
            </Menu>

            {/* View Parent Dialog */}
            <Dialog
                open={openViewDialog}
                onClose={() => setOpenViewDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconUsers size={24} />
                        <Typography variant="h5">Parent Details</Typography>
                    </Box>
                    <IconButton onClick={() => setOpenViewDialog(false)} size="small">
                        <IconX />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    {selectedParent && (
                        <Box>
                            {/* Header with Avatar and Status */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        bgcolor: 'secondary.main',
                                        fontSize: '2rem'
                                    }}
                                >
                                    {selectedParent.first_name?.[0]?.toUpperCase() || 'P'}
                                    {selectedParent.last_name?.[0]?.toUpperCase() || 'T'}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h4">
                                        {selectedParent.full_name || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {selectedParent.email || 'N/A'}
                                    </Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <Chip
                                            label={selectedParent.is_active ? 'Active' : 'Inactive'}
                                            color={selectedParent.is_active ? 'success' : 'error'}
                                            size="small"
                                        />
                                        <Chip
                                            label={selectedParent.profile?.relation_type || 'N/A'}
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                            sx={{ ml: 1 }}
                                        />
                                    </Box>
                                </Box>
                            </Box>

                            <MuiDivider sx={{ my: 2 }} />

                            {/* Contact Information */}
                            <Typography variant="h6" sx={{ mb: 2 }}>Contact Information</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Email
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedParent.email || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Phone Number
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedParent.phone || 'N/A'}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <MuiDivider sx={{ my: 2 }} />

                            {/* Father's Information */}
                            <Typography variant="h6" sx={{ mb: 2 }}>Father's Information</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Full Name
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedParent.profile?.father_full_name || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Phone Number
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedParent.profile?.father_phone || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Occupation
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedParent.profile?.father_occupation || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Qualification
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedParent.profile?.father_qualification || 'N/A'}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <MuiDivider sx={{ my: 2 }} />

                            {/* Mother's Information */}
                            <Typography variant="h6" sx={{ mb: 2 }}>Mother's Information</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Full Name
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedParent.profile?.mother_full_name || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Phone Number
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedParent.profile?.mother_phone || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Occupation
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedParent.profile?.mother_occupation || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Qualification
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedParent.profile?.mother_qualification || 'N/A'}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <MuiDivider sx={{ my: 2 }} />

                            {/* Address Information */}
                            <Typography variant="h6" sx={{ mb: 2 }}>Address Information</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">
                                        Address
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedParent.profile?.address || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="caption" color="text.secondary">
                                        City
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedParent.profile?.city || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="caption" color="text.secondary">
                                        State
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedParent.profile?.state || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="caption" color="text.secondary">
                                        Postal Code
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedParent.profile?.postal_code || 'N/A'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setOpenViewDialog(false)}
                        variant="outlined"
                        size="small"
                    >
                        Close
                    </Button>
                    <Button
                        onClick={() => {
                            setOpenViewDialog(false);
                            handleEditParent(selectedParent);
                        }}
                        variant="contained"
                        size="small"
                        startIcon={<IconEdit fontSize="medium" />}
                    >
                        Edit Parent
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconTrash fontSize="medium" />
                    Delete Parent
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete "{selectedParent?.full_name || 'this parent'}"?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={confirmDeleteParent} variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ParentsList;
