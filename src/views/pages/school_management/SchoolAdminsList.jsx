import React, { useEffect, useState } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    IconButton, Menu, MenuItem, ListItemIcon, ListItemText,
    Divider, Tooltip, Fade, Box, TextField, InputAdornment
} from "@mui/material";
import { Table, Tag } from "antd";
import LockResetIcon from "@mui/icons-material/LockReset";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EditIcon from "@mui/icons-material/Edit";
import customAxios from "../../../utils/axiosConfig";
import MainCard from "../../../ui-component/cards/MainCard";
import EduSphereLoader from "../../../ui-component/EduSphereLoader";
import { toast } from 'react-toastify';
import { SCHOOL_API_BASE_URL } from "../../../ApiConstants";
import SchoolAdminForm from "./schoolAdminForm";

function SchoolAdminsList() {
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const resp = await customAxios.get(SCHOOL_API_BASE_URL + '/list/school-admins');
            if (resp.data.code === 200 && resp.data.status === 'success') {
                const admins = resp.data.data.map((admin, index) => ({
                    ...admin,
                    key: admin.id,
                    slNo: index + 1
                }));
                setRows(admins);
            }
        } catch (error) {
            console.error("Error fetching school admins:", error);
            toast.error("Failed to fetch school admins");
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (admin) => {
        // Create a school object structure that your form expects
        const schoolObj = {
            id: admin.school_id,
            name: admin.school_name,
            code: admin.school_code,
            skid: admin.skid,
            school_admin_id: admin.id // This makes it edit mode in your form
        };

        setSelectedSchool(schoolObj);
        setEditDialogOpen(true);
    };

    const handleEditClose = () => {
        setEditDialogOpen(false);
        setSelectedSchool(null);
        fetchAdmins(); // Refresh the list
    };

    const handleChangePassword = (admin) => {
        setSelectedAdmin(admin);
        setPasswordDialogOpen(true);
        setNewPassword('');
        setShowPassword(false);
    };

    const handleConfirmPasswordChange = async () => {
        if (!newPassword || newPassword.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }

        try {
            setLoading(true);
            const resp = await customAxios.patch(
                `${SCHOOL_API_BASE_URL}/school-admin/change-password/${selectedAdmin.id}`,
                { new_password: newPassword }
            );

            if (resp.data.code === 200 && resp.data.status === 'success') {
                toast.success(resp.data.message || "Password changed successfully!");
                setPasswordDialogOpen(false);
                setNewPassword('');
            } else {
                toast.error(resp.data.message || "Failed to change password.");
            }
        } catch (err) {
            console.error("Password change error:", err);
            toast.error(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const generateRandomPassword = () => {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setNewPassword(password);
        setShowPassword(true);
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
            title: "Name",
            key: "name",
            render: (_, record) => `${record.first_name} ${record.last_name}`,
            sorter: (a, b) => a.first_name.localeCompare(b.first_name),
        },
        {
            title: "Username",
            dataIndex: "username",
            key: "username",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Phone",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "School",
            dataIndex: "school_name",
            key: "school_name",
            render: (school_name, record) => (
                <Box>
                    <div>{school_name}</div>
                    {record.school_code && record.school_code !== '-' && (
                        <Tag color="blue" size="small">{record.school_code}</Tag>
                    )}
                </Box>
            )
        },
        {
            title: "Status",
            dataIndex: "is_active",
            key: "is_active",
            align: "center",
            render: (is_active) => (
                <Tag color={is_active ? 'green' : 'red'}>
                    {is_active ? 'Active' : 'Inactive'}
                </Tag>
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
                <MainCard title={'School Admins'}>
                    <Table
                        columns={columns}
                        dataSource={rows}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            pageSizeOptions: ['5', '10', '20', '50'],
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} admins`
                        }}
                        bordered
                        size="middle"
                        scroll={{ x: 680, y: 400 }}
                    />
                </MainCard>
            </Fade>

            {/* Edit School Admin Dialog - Reusing your existing form */}
            <Dialog
                open={editDialogOpen}
                onClose={handleEditClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EditIcon color="primary" />
                    Edit School Admin for "{selectedSchool?.name}"
                </DialogTitle>
                {selectedSchool && (
                    <SchoolAdminForm
                        school={selectedSchool}
                        onClose={handleEditClose}
                    />
                )}
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog
                open={passwordDialogOpen}
                onClose={() => setPasswordDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LockResetIcon color="primary" />
                    Change Password for {selectedAdmin?.first_name} {selectedAdmin?.last_name}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="New Password"
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password (min 8 characters)"
                            helperText="Password must be at least 8 characters long"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Button
                            onClick={generateRandomPassword}
                            variant="outlined"
                            size="small"
                            sx={{ mt: 2 }}
                        >
                            Generate Random Password
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setPasswordDialogOpen(false)}
                        variant="outlined"
                        color="primary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmPasswordChange}
                        variant="contained"
                        color="primary"
                        disabled={!newPassword || newPassword.length < 8}
                    >
                        Change Password
                    </Button>
                </DialogActions>
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
                        primary="Edit Details"
                        slotProps={{ primary: { sx: { fontSize: { xs: '0.875rem', sm: '1rem' } } } }}
                    />
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleChangePassword(menuRowData); handleMenuClose(); }}>
                    <ListItemIcon><LockResetIcon fontSize="medium" color="primary" /></ListItemIcon>
                    <ListItemText
                        primary="Change Password"
                        slotProps={{ primary: { sx: { fontSize: { xs: '0.875rem', sm: '1rem' } } } }}
                    />
                </MenuItem>
            </Menu>
        </>
    );
}

export default SchoolAdminsList;
