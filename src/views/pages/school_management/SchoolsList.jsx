import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent, DialogContentText,
    DialogTitle,
    Divider,
    Fade,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu, MenuItem,
    Tooltip
} from "@mui/material";
import { Switch, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { SCHOOL_API_BASE_URL } from "../../../ApiConstants";
import MainCard from "../../../ui-component/cards/MainCard";
import EduSphereLoader from "../../../ui-component/EduSphereLoader";
import customAxios from "../../../utils/axiosConfig";
import SchoolAdminForm from "./schoolAdminForm";

function SchoolsList() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [statusAction, setStatusAction] = useState(null);
    const [assignAdminOpen, setAssignAdminOpen] = useState(false);
    const [schoolForAdmin, setSchoolForAdmin] = useState(null);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuRowData, setMenuRowData] = useState(null);

    const handleMenuOpen = (event, row) => {
        setMenuAnchorEl(event.currentTarget);
        setMenuRowData(row);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setMenuRowData(null);
    };

    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        try {
            setLoading(true);
            const resp = await customAxios.get(SCHOOL_API_BASE_URL + '/list');
            if (resp.data.code === 200 && resp.data.status === 'success') {
                const schools = resp.data.data.map((school, index) => ({
                    ...school,
                    key: school.id,
                    slNo: index + 1
                }));
                setRows(schools);
            }
        } catch (error) {
            console.error("Error fetching schools:", error);
            toast.error("Failed to fetch schools");
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (school) => {
        navigate('/school/update', { state: { school, mode: 'update' } });
    };

    const handleStatusToggle = (school) => {
        setSelectedSchool(school);
        setStatusAction(school.is_active ? 'deactivate' : 'activate');
        setConfirmOpen(true);
    };

    const handleConfirmStatusChange = async () => {
        try {
            setLoading(true);
            const endpoint = statusAction === 'deactivate'
                ? `${SCHOOL_API_BASE_URL}/deactivate/${selectedSchool.id}`
                : `${SCHOOL_API_BASE_URL}/activate/${selectedSchool.id}`;

            const resp = await customAxios.patch(endpoint);

            if (resp.data.code === 200 && resp.data.status === 'success') {
                toast.success(resp.data.message || `School ${statusAction}d successfully!`);
                fetchSchools();
            } else {
                toast.error(resp.data.message || `Failed to ${statusAction} school.`);
            }
        } catch (err) {
            console.error("Status change error:", err);
            toast.error("Something went wrong.");
        } finally {
            setConfirmOpen(false);
            setLoading(false);
        }
    };

    const handleDelete = (school) => {
        setSelectedSchool(school);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setLoading(true);
            const resp = await customAxios.delete(`${SCHOOL_API_BASE_URL}/delete/${selectedSchool.id}`);

            if (resp.data.code === 200 && resp.data.status === 'success') {
                toast.success(resp.data.message || "School deleted successfully!");

                // Show warning if database drop failed
                if (resp.data.warning) {
                    toast.warning(`Warning: ${resp.data.warning}`, { autoClose: 10000 });
                }

                fetchSchools();
            } else {
                toast.error(resp.data.message || "Failed to delete school.");
            }
        } catch (err) {
            console.error("Delete error:", err);
            toast.error(err.response?.data?.message || "Something went wrong.");
        } finally {
            setDeleteConfirmOpen(false);
            setLoading(false);
        }
    };

    const openAssignAdminModal = (school) => {
        setSchoolForAdmin(school);
        setAssignAdminOpen(true);
    };

    const columns = [
        {
            title: "Sl. No",
            dataIndex: "slNo",
            key: "slNo",
            width: 80,
            align: "center"
        },
        {
            title: "School Name",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: "Code",
            dataIndex: "code",
            key: "code",
        },
        {
            title: "City",
            dataIndex: "city",
            key: "city",
        },
        {
            title: "Phone",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "Plan",
            dataIndex: "plan",
            key: "plan",
            sorter: (a, b) => a.plan.localeCompare(b.plan),
            render: (plan) => (
                <Tag color={plan === 'PREMIUM' ? 'gold' : plan === 'STANDARD' ? 'blue' : 'default'}>
                    {plan}
                </Tag>
            )
        },
        {
            title: "Status",
            dataIndex: "is_active",
            key: "is_active",
            width: 120,
            align: "center",
            render: (is_active, record) => (
                <Switch
                    checked={is_active}
                    onChange={() => handleStatusToggle(record)}
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                />
            )
        },
        {
            title: "Actions",
            key: "actions",
            width: 100,
            align: "center",
            render: (_, record) => (
                <Tooltip title="More actions">
                    <IconButton onClick={(event) => handleMenuOpen(event, record)}>
                        <MoreVertIcon />
                    </IconButton>
                </Tooltip>
            ),
        },
    ];

    return (
        <>
            <EduSphereLoader loading={loading} />
            <Fade in timeout={600}>
                <MainCard title={'School List'}>
                    <Box sx={{ width: "100%" }}>
                        <Table
                            columns={columns}
                            dataSource={rows}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                pageSizeOptions: ['5', '10', '20', '50'],
                                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} schools`
                            }}
                            bordered
                            size="middle"
                            scroll={{ x: 680, y: 400 }}
                        />
                    </Box>
                </MainCard>
            </Fade>

            {/* Confirmation dialog for Status Change (Activate/Deactivate) */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
                    <WarningAmberIcon color="warning" />
                    Confirm {statusAction === 'deactivate' ? 'Deactivation' : 'Activation'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontSize: '1rem', color: 'text.primary' }}>
                        Are you sure you want to {statusAction} the school <strong>"{selectedSchool?.name}"</strong>?
                        {statusAction === 'deactivate' && (
                            <span> Users from this school will not be able to log in.</span>
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setConfirmOpen(false)}
                        variant="outlined"
                        color="primary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmStatusChange}
                        variant="contained"
                        color={statusAction === 'deactivate' ? 'warning' : 'success'}
                    >
                        {statusAction === 'deactivate' ? 'Deactivate' : 'Activate'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirmation dialog for Hard Delete */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'error.main',
                    bgcolor: 'error.lighter',
                    borderBottom: '2px solid',
                    borderColor: 'error.main'
                }}>
                    <ErrorOutlineIcon color="error" fontSize="large" />
                    Permanent Deletion Warning
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <DialogContentText sx={{ fontSize: '1rem', color: 'text.primary', mb: 2 }}>
                        <strong style={{ color: '#d32f2f' }}>⚠️ CRITICAL ACTION - THIS CANNOT BE UNDONE!</strong>
                    </DialogContentText>
                    <DialogContentText sx={{ fontSize: '0.95rem', color: 'text.primary', mb: 1 }}>
                        You are about to <strong>permanently delete</strong> the school:
                    </DialogContentText>
                    <Box sx={{
                        bgcolor: 'grey.100',
                        p: 2,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'grey.300',
                        mb: 2
                    }}>
                        <strong>{selectedSchool?.name}</strong> ({selectedSchool?.code})
                    </Box>
                    <DialogContentText sx={{ fontSize: '0.95rem', color: 'text.primary', mb: 1 }}>
                        This action will:
                    </DialogContentText>
                    <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                        <li>Delete <strong>all users</strong> associated with this school</li>
                        <li>Drop the school's <strong>dedicated database</strong> (skool_{selectedSchool?.skid})</li>
                        <li>Remove <strong>all academic data, records, and configurations</strong></li>
                        <li>This action is <strong style={{ color: '#d32f2f' }}>IRREVERSIBLE</strong></li>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button
                        onClick={() => setDeleteConfirmOpen(false)}
                        variant="contained"
                        color="primary"
                        size="large"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        color="error"
                        size="large"
                        startIcon={<DeleteIcon />}
                    >
                        Yes, Permanently Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create and Assign school admin */}
            <Dialog open={assignAdminOpen} onClose={() => setAssignAdminOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachFileIcon color="primary" />
                    Create and Assign School Admin to "{schoolForAdmin?.name}"
                </DialogTitle>
                {schoolForAdmin && (
                    <SchoolAdminForm
                        school={schoolForAdmin}
                        onClose={() => setAssignAdminOpen(false)}
                    />
                )}
            </Dialog>

            {/* Actions menu */}
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={() => { handleEdit(menuRowData); handleMenuClose(); }}>
                    <ListItemIcon><EditIcon fontSize="medium" /></ListItemIcon>
                    <ListItemText
                        primary="Edit"
                        slotProps={{ primary: { sx: { fontSize: { xs: '0.875rem', sm: '1rem' } } } }}
                    />
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { openAssignAdminModal(menuRowData); handleMenuClose(); }}>
                    <ListItemIcon><AttachFileIcon fontSize="medium" color="secondary" /></ListItemIcon>
                    <ListItemText
                        primary="Assign Admin"
                        slotProps={{ primary: { sx: { fontSize: { xs: '0.875rem', sm: '1rem' } } } }}
                    />
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={() => { handleDelete(menuRowData); handleMenuClose(); }}
                    sx={{ color: 'error.main' }}
                >
                    <ListItemIcon><DeleteIcon fontSize="medium" color="error" /></ListItemIcon>
                    <ListItemText
                        primary="Delete Permanently"
                        slotProps={{ primary: { sx: { fontSize: { xs: '0.875rem', sm: '1rem' } } } }}
                    />
                </MenuItem>
            </Menu>
        </>
    );
}

export default SchoolsList;
