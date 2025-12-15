// components/parents/ParentCreate.jsx
import {
    Alert, Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    InputLabel,
    MenuItem,
    OutlinedInput, Select,
    Stack
} from "@mui/material";
import { Divider } from 'antd';
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PARENTS_API_BASE_URL } from "../../../ApiConstants";
import { labelStyles } from "../../../AppConstants";
import MainCard from "../../../ui-component/cards/MainCard";
import EduSphereLoader from "../../../ui-component/EduSphereLoader";
import customAxios from "../../../utils/axiosConfig";

const ParentCreateOrUpdate = ({
    isDialog = false,  // NEW: Support dialog mode
    onClose = null,    // NEW: Callback for dialog close
    onSuccess = null,  // NEW: Callback when parent created successfully
    skid = null        // NEW: Pass skid from parent component
}) => {
    const { loggedUser } = useSelector((state) => state.globalState || {});
    const navigate = useNavigate();
    const location = useLocation();
    const mode = location.state?.mode || 'create';
    const parentData = location.state?.parent || {};
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: null,
        username: null,
        phone: null,
        password: "Parent@123",
        relation_type: "Father",
        first_name: null,
        last_name: null,
        father_full_name: null,
        father_phone: null,
        father_occupation: null,
        father_qualification: null,
        mother_full_name: null,
        mother_occupation: null,
        mother_phone: null,
        mother_qualification: null,
        address: null,
        city: null,
        state: null,
        postal_code: null,
        role_id: 5,
    });

    useEffect(() => {
        if (mode === "update" && parentData) {
            setFormData({
                id: parentData.id,
                email: parentData.email || null,
                username: parentData.username || null,
                phone: parentData.phone || null,
                first_name: parentData.first_name || null,
                last_name: parentData.last_name || null,
                gender: parentData.gender || null,
                date_of_birth: parentData.date_of_birth || null,
                relation_type: parentData.profile?.relation_type || "Father",
                father_full_name: parentData.profile?.father_full_name || null,
                father_phone: parentData.profile?.father_phone || null,
                father_occupation: parentData.profile?.father_occupation || null,
                father_qualification: parentData.profile?.father_qualification || null,
                mother_full_name: parentData.profile?.mother_full_name || null,
                mother_phone: parentData.profile?.mother_phone || null,
                mother_occupation: parentData.profile?.mother_occupation || null,
                mother_qualification: parentData.profile?.mother_qualification || null,
                address: parentData.profile?.address || null,
                city: parentData.profile?.city || null,
                state: parentData.profile?.state || null,
                postal_code: parentData.profile?.postal_code || null,
                role_id: 5,
            });
        }
    }, [parentData, mode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const splitFullName = () => {
        const fullName = formData?.father_full_name || formData?.mother_full_name || '';
        const nameParts = fullName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        return { firstName, lastName };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const updatedFormData = { ...formData };

            // Only split name if creating new parent
            if (mode === 'create') {
                const { firstName, lastName } = splitFullName();
                updatedFormData.first_name = firstName;
                updatedFormData.last_name = lastName;
            }

            let resp;
            if (mode === 'update') {
                resp = await customAxios.put(
                    `${PARENTS_API_BASE_URL}/update/${loggedUser?.skid}/${formData.id}`,
                    updatedFormData
                );
                if (resp?.data?.code === 200 && resp?.data?.status === "success") {
                    toast.success(resp?.data?.message);
                    navigate(-1);
                }
            } else {
                resp = await customAxios.post(
                    `${PARENTS_API_BASE_URL}/create/details/${loggedUser?.skid}`, updatedFormData
                );
                if (resp?.data?.code === 200 && resp?.data?.status === "success") {
                    toast.success(resp?.data?.message);

                    // If in dialog mode, call onSuccess callback
                    if (isDialog && onSuccess) {
                        onSuccess({
                            ...resp.data.data,
                            relation_type: formData.relation_type,
                            full_name: `${firstName} ${lastName}`,
                            father_full_name: formData.father_full_name,
                            mother_full_name: formData.mother_full_name
                        });
                    } else {
                        navigate(-1);
                    }
                }
            }
        } catch (error) {
            console.error("Error creating parent:", error);
            toast.error(error.response?.data?.message || "Error creating parent");
        } finally {
            setLoading(false);
        }
    };

    // Form content (extracted for reuse)
    const formContent = (
        <>
            <EduSphereLoader loading={loading} />
            <Alert severity="info" sx={{ mb: 3 }}>
                Please fill in the family details. One login will be created for both parents.
            </Alert>

            <form onSubmit={handleSubmit}>
                {/* Login Credentials Section */}
                <Divider orientation="left" style={{ borderColor: '#69a0f3ff' }}> Login Credentials</Divider>
                <Grid container spacing={2}>
                    <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                        <Stack spacing={1}>
                            <InputLabel required sx={labelStyles}>
                                Email
                            </InputLabel>
                            <OutlinedInput
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="johndoe@gmail.com"
                                fullWidth
                            />
                        </Stack>
                    </Grid>

                    <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                        <Stack spacing={1}>
                            <InputLabel sx={labelStyles}>
                                Username
                            </InputLabel>
                            <OutlinedInput
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Stack>
                    </Grid>

                    <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                        <Stack spacing={1}>
                            <InputLabel required sx={labelStyles}>
                                Phone Number
                            </InputLabel>
                            <OutlinedInput
                                name="phone"
                                type="number"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Primary contact number"
                                fullWidth
                            />
                        </Stack>
                    </Grid>

                    <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                        <Stack spacing={1}>
                            <InputLabel sx={labelStyles}>
                                Relationship to Student
                            </InputLabel>
                            <Select
                                name="relation_type"
                                value={formData.relation_type}
                                onChange={handleChange}
                                fullWidth
                            >
                                <MenuItem value="Father">Father</MenuItem>
                                <MenuItem value="Mother">Mother</MenuItem>
                                <MenuItem value="Guardian">Guardian</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                            </Select>
                        </Stack>
                    </Grid>
                </Grid>
                <br />

                {/* Father's Details Section */}
                <Divider orientation="left" style={{ borderColor: '#7964f0ff' }}> Family Details</Divider>
                <Grid container columnSpacing={2} rowGap={3}>
                    <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                        <Stack spacing={1}>
                            <InputLabel required sx={labelStyles}>
                                Full Name
                            </InputLabel>
                            <OutlinedInput
                                name="father_full_name"
                                value={formData.father_full_name}
                                onChange={handleChange}
                                placeholder="Father's full name"
                                fullWidth
                            />
                        </Stack>
                    </Grid>

                    <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                        <Stack spacing={1}>
                            <InputLabel sx={labelStyles}>
                                Occupation
                            </InputLabel>
                            <OutlinedInput
                                name="father_occupation"
                                value={formData.father_occupation}
                                onChange={handleChange}
                                placeholder="Father's occupation"
                                fullWidth
                            />
                        </Stack>
                    </Grid>

                    <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                        <Stack spacing={1}>
                            <InputLabel sx={labelStyles}>
                                Phone Number
                            </InputLabel>
                            <OutlinedInput
                                name="father_phone"
                                value={formData.father_phone}
                                onChange={handleChange}
                                placeholder="Father's phone number"
                                fullWidth
                            />
                        </Stack>
                    </Grid>

                    <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                        <Stack spacing={1}>
                            <InputLabel sx={labelStyles}>
                                Qualification
                            </InputLabel>
                            <OutlinedInput
                                name="father_qualification"
                                value={formData.father_qualification}
                                onChange={handleChange}
                                placeholder="Father's educational qualification"
                                fullWidth
                            />
                        </Stack>
                    </Grid>

                    <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                        <Stack spacing={1}>
                            <InputLabel required sx={labelStyles}>
                                Full Name
                            </InputLabel>
                            <OutlinedInput
                                name="mother_full_name"
                                value={formData.mother_full_name}
                                onChange={handleChange}
                                placeholder="Mother's full name"
                                fullWidth
                            />
                        </Stack>
                    </Grid>

                    <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                        <Stack spacing={1}>
                            <InputLabel sx={labelStyles}>
                                Occupation
                            </InputLabel>
                            <OutlinedInput
                                name="mother_occupation"
                                value={formData.mother_occupation}
                                onChange={handleChange}
                                placeholder="Mother's occupation"
                                fullWidth
                            />
                        </Stack>
                    </Grid>

                    <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                        <Stack spacing={1}>
                            <InputLabel sx={labelStyles}>
                                Phone Number
                            </InputLabel>
                            <OutlinedInput
                                name="mother_phone"
                                value={formData.mother_phone}
                                onChange={handleChange}
                                placeholder="Mother's phone number"
                                fullWidth
                            />
                        </Stack>
                    </Grid>

                    <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                        <Stack spacing={1}>
                            <InputLabel sx={labelStyles}>
                                Qualification
                            </InputLabel>
                            <OutlinedInput
                                name="mother_qualification"
                                value={formData.mother_qualification}
                                onChange={handleChange}
                                placeholder="Mother's educational qualification"
                                fullWidth
                            />
                        </Stack>
                    </Grid>
                    <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                        <Stack spacing={1}>
                            <InputLabel sx={labelStyles}>
                                Street Address
                            </InputLabel>
                            <OutlinedInput
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="House number, street name"
                                fullWidth
                            />
                        </Stack>
                    </Grid>

                    <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                        <Stack spacing={1}>
                            <InputLabel sx={labelStyles}>
                                City
                            </InputLabel>
                            <OutlinedInput
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="City"
                                fullWidth
                            />
                        </Stack>
                    </Grid>

                    <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                        <Stack spacing={1}>
                            <InputLabel sx={labelStyles}>
                                State
                            </InputLabel>
                            <OutlinedInput
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="State"
                                fullWidth
                            />
                        </Stack>
                    </Grid>

                    <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                        <Stack spacing={1}>
                            <InputLabel sx={labelStyles}>
                                Postal Code
                            </InputLabel>
                            <OutlinedInput
                                name="postal_code"
                                value={formData.postal_code}
                                onChange={handleChange}
                                placeholder="Postal/Zip code"
                                fullWidth
                            />
                        </Stack>
                    </Grid>
                </Grid>
            </form>
        </>
    );

    // If dialog mode, return dialog
    if (isDialog) {
        return (
            <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>Create New Parent/Guardian</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent dividers>
                        {formContent}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading || !formData.email || !formData.phone}
                        >
                            Create Parent
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }

    // Otherwise, return full page
    return (
        <MainCard title="Create New Parent">
            <form onSubmit={handleSubmit}>
                {formContent}
                <Box sx={{
                    mt: 4,
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'flex-end',
                    pt: 2,
                    borderTop: 1,
                    borderColor: 'divider'
                }}>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => navigate('/parent/list')}
                        sx={{ px: 3 }}
                        size="small"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        type="submit"
                        color="primary"
                        disabled={loading}
                        sx={{ px: 3 }}
                        size="small"
                    >
                        {/* {mode === 'update' ? "Update Student" : "Create Student"} */}
                        Save Parent Details
                    </Button>
                </Box>
            </form>
        </MainCard>
    );
};

export default ParentCreateOrUpdate;
