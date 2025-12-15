// components/fees/FeeStructureList.jsx

import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Tooltip,
    DialogActions,
    Button,
    Alert
} from '@mui/material';
import {
    IconCurrencyRupee,
    IconEdit,
    IconEye,
    IconPlus,
    IconTrash,
    IconUsersGroup
} from '@tabler/icons-react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Table, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FEES_API_BASE_URL } from '../../../ApiConstants';
import HeaderCard from '../../../ui-component/cards/HeaderCard';
import MainCard from '../../../ui-component/cards/MainCard';
import EduSphereLoader from '../../../ui-component/EduSphereLoader';
import customAxios from '../../../utils/axiosConfig';

const FeeStructureList = () => {
    const { loggedUser, academicYear } = useSelector(state => ({
        loggedUser: state.globalState?.loggedUser || null,
        academicYear: state.globalState?.academicYear || null
    }));

    const navigate = useNavigate();
    const [groupedFees, setGroupedFees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedClassFees, setSelectedClassFees] = useState([]);
    const [selectedClassForAssign, setSelectedClassForAssign] = useState(null);
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
        fetchGroupedFeeStructures();
    }, [academicYear]);

    const fetchGroupedFeeStructures = async () => {
        try {
            setLoading(true);
            const params = {
                academic_year_id: academicYear?.id
            };

            const response = await customAxios.get(
                `${FEES_API_BASE_URL}/structure/list/${loggedUser?.skid}`,
                { params }
            );

            if (response.data.code === 200) {
                const feeStructures = response.data.data || [];

                // Group by class_id
                const grouped = feeStructures.reduce((acc, fee) => {
                    const classId = fee.class_id;
                    if (!acc[classId]) {
                        acc[classId] = {
                            class_id: classId,
                            class_name: fee.class?.class_name || 'N/A',
                            academic_year: fee.academic_year,
                            fees: [],
                            total_amount: 0,
                            fee_count: 0
                        };
                    }

                    acc[classId].fees.push(fee);
                    acc[classId].total_amount += parseFloat(fee.amount || 0);
                    acc[classId].fee_count += 1;
                    return acc;
                }, {});

                setGroupedFees(Object.values(grouped));
            }
        } catch (error) {
            console.error('Error fetching fee structures:', error);
            toast.error('Failed to fetch fee structures');
        } finally {
            setLoading(false);
        }
    };

    const handleView = (record) => {
        setSelectedClassFees(record.fees);
        setViewDialogOpen(true);
    };

    const handleEdit = (record) => {
        navigate(`/fee/structure/edit/${record.class_id}`);
        handleMenuClose();
    };

    const handleAssignToClass = (record) => {
        setSelectedClassForAssign(record);
        setAssignDialogOpen(true);
        handleMenuClose();
    };

    const confirmAssignToClass = async () => {
        if (!selectedClassForAssign) return;

        try {
            setLoading(true);
            const response = await customAxios.post(
                `${FEES_API_BASE_URL}/assign/class/${loggedUser?.skid}`,
                {
                    class_id: selectedClassForAssign.class_id,
                    academic_year_id: academicYear?.id
                }
            );

            if (response.data.code === 200) {
                const data = response.data.data;
                toast.success(
                    `Fees assigned to ${data.total_students} students! ` +
                    `Assigned: ${data.total_fees_assigned} | Already Exists: ${data.total_fees_skipped}`
                );
                setAssignDialogOpen(false);
                setSelectedClassForAssign(null);
            }
        } catch (error) {
            console.error('Error in bulk assignment:', error);
            toast.error(error.response?.data?.message || 'Failed to assign fees');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (record) => {
        if (window.confirm(
            `Delete all fee structures for ${record.class_name}?\n\n` +
            `This will delete ${record.fee_count} fee(s) with total amount ₹${record.total_amount.toLocaleString()}.\n\n` +
            `Note: This action cannot be undone and will fail if fees are already assigned to students.`
        )) {
            try {
                setLoading(true);
                const response = await customAxios.delete(
                    `${FEES_API_BASE_URL}/structure/delete-class/${loggedUser?.skid}/${record.class_id}/${academicYear?.id}`
                );

                if (response.data.code === 200) {
                    toast.success(response.data.message);
                    fetchGroupedFeeStructures(); // Refresh list
                }
            } catch (error) {
                console.error('Error deleting fee structures:', error);
                toast.error(error.response?.data?.message || 'Failed to delete fee structures');
            } finally {
                setLoading(false);
            }
        }
        handleMenuClose();
    };

    const columns = [
        {
            title: 'Class',
            dataIndex: 'class_name',
            key: 'class_name',
            render: (text) => <Typography fontWeight={600}>{text}</Typography>,
        },
        {
            title: 'Number of Fees',
            dataIndex: 'fee_count',
            key: 'fee_count',
            align: 'center',
            width: 150,
            render: (count) => <Tag color="blue">{count} Fees</Tag>,
        },
        {
            title: 'Total Amount',
            dataIndex: 'total_amount',
            key: 'total_amount',
            align: 'right',
            width: 200,
            render: (amount) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <IconCurrencyRupee size={16} />
                    <Typography>{amount?.toLocaleString()}</Typography>
                </Box>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            width: 100,
            render: (_, record) => (
                <Tooltip title="More actions">
                    <IconButton onClick={(event) => handleMenuOpen(event, record)}>
                        <MoreVertIcon />
                    </IconButton>
                </Tooltip>
            ),
        },
    ];

    // Detail Table Columns for View Dialog
    const detailColumns = [
        {
            title: 'Fee Name',
            dataIndex: 'fee_name',
            key: 'fee_name',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            render: (amount) => `₹${amount?.toLocaleString()}`,
        },
        {
            title: 'Mandatory',
            dataIndex: 'is_mandatory',
            key: 'is_mandatory',
            align: 'center',
            render: (mandatory) => (
                <Tag color={mandatory ? 'green' : 'default'}>
                    {mandatory ? 'Yes' : 'No'}
                </Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            align: 'center',
            render: (active) => (
                <Tag color={active ? 'success' : 'error'}>
                    {active ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
    ];

    const breadcrumbLinks = [
        { title: 'Dashboard', to: '/dashboard' },
        { title: 'Fee Structures', to: '/fee/structures' },
    ];

    return (
        <>
            <EduSphereLoader loading={loading} />
            <HeaderCard
                heading="Fee Structures and Assignment"
                breadcrumbLinks={breadcrumbLinks}
                buttonColor={'primary'}
                buttonvariant={'contained'}
                buttonText="Create Fee Structure"
                onButtonClick={() => navigate('/fee/structure/create')}
                buttonIcon={<IconPlus size={20} />}
            />

            <MainCard>
                <Table
                    columns={columns}
                    dataSource={groupedFees}
                    rowKey="class_id"
                    pagination={{
                        showTotal: (total) => `Total ${total} classes`,
                    }}
                    scroll={{ x: 680, y: 400 }}
                />
            </MainCard>

            {/* View Details Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconEye />
                        Fee Structure Details
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Table
                        columns={detailColumns}
                        dataSource={selectedClassFees}
                        rowKey="id"
                        pagination={false}
                        size="small"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Assign Confirmation Dialog */}
            <Dialog
                open={assignDialogOpen}
                onClose={() => setAssignDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconUsersGroup color="#1976d2" />
                        Assign Fees to Entire Class
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        This will automatically assign all fees to all students in the selected class.
                    </Alert>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Class:</strong> {selectedClassForAssign?.class_name}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Number of Fees:</strong> {selectedClassForAssign?.fee_count}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        <strong>Total Amount:</strong> ₹{selectedClassForAssign?.total_amount?.toLocaleString()}
                    </Typography>
                    <Alert severity="warning">
                        Fees that are already assigned to students will be skipped automatically.
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setAssignDialogOpen(false)}
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmAssignToClass}
                        variant="contained"
                        color="primary"
                        startIcon={<IconUsersGroup />}
                    >
                        Assign to All Students
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Actions Menu */}
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={() => { handleView(menuRowData); handleMenuClose(); }}>
                    <ListItemIcon>
                        <IconEye size={20} />
                    </ListItemIcon>
                    <ListItemText>View Details</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => handleEdit(menuRowData)}>
                    <ListItemIcon>
                        <IconEdit size={20} />
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => handleAssignToClass(menuRowData)}>
                    <ListItemIcon>
                        <IconUsersGroup size={20} color="#1976d2" />
                    </ListItemIcon>
                    <ListItemText>Assign to Class</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => handleDelete(menuRowData)}>
                    <ListItemIcon>
                        <IconTrash size={20} color="#d32f2f" />
                    </ListItemIcon>
                    <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
};

export default FeeStructureList;
