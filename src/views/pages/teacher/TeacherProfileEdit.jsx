import {
    Button,
    Grid,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Stack,
    useTheme
} from "@mui/material";
import { IconArrowLeft, IconUser } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { TEACHERS_API_BASE_URL } from "../../../ApiConstants";
import HeaderCard from "../../../ui-component/cards/HeaderCard";
import MainCard from "../../../ui-component/cards/MainCard";
import EduSphereLoader from "../../../ui-component/EduSphereLoader";
import customAxios from "../../../utils/axiosConfig";
import MandatoryIndicator from "../components/MandatoryIndicator";
import { inputStyles, labelStyles } from "../../../AppConstants";

export default function TeacherProfileEdit() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { loggedUser } = useSelector((state) => state.globalState || {});

    const [formData, setFormData] = useState({
        first_name: null,
        last_name: null,
        email: null,
        phone: null,
        gender: null,
        date_of_birth: null,
        address: null,
        date_of_joining: null,
        employee_id: null,
        designation: null,
        qualifications: null,
    });

    useEffect(() => {
        fetchTeacherProfile();
    }, []);

    const fetchTeacherProfile = async () => {
        try {
            setLoading(true);
            const resp = await customAxios.get(
                `${TEACHERS_API_BASE_URL}/profile/${loggedUser?.skid}/${loggedUser?.school_user_id}`
            );

            if (resp?.data?.code === 200 && resp?.data?.status === 'success') {
                const profileData = resp.data.teacher_data;
                setFormData({
                    ...profileData,
                    first_name: profileData.first_name || null,
                    last_name: profileData.last_name || null,
                    email: profileData.email || null,
                    phone: profileData.phone || null,
                    gender: profileData.gender || null,
                    date_of_birth: profileData.date_of_birth
                        ? dayjs(profileData.date_of_birth).format("YYYY-MM-DD")
                        : null,
                    address: profileData.address || null,
                    date_of_joining: profileData.profile?.date_of_joining
                        ? dayjs(profileData.profile.date_of_joining).format("YYYY-MM-DD")
                        : null,
                    employee_id: profileData.profile?.employee_id || null,
                    designation: profileData.profile?.designation || null,
                    qualifications: profileData.profile?.qualifications || null,
                });
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error("Failed to load profile data");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const resp = await customAxios.put(TEACHERS_API_BASE_URL + '/update/' + loggedUser?.skid + '/' + formData.id, formData);
            if (resp?.data?.code === 200 && resp?.data?.status === 'success') {
                toast.success("Profile updated successfully!");
                navigate(-1);
            } else {
                toast.error(resp.data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const breadcrumbLinks = [
        { title: 'Dashboard', to: '/dashboard' },
        { title: 'My Profile', to: '/profile/edit' },
    ];

    return (
        <>
            <EduSphereLoader loading={loading} />
            <HeaderCard
                heading="Edit My Profile"
                breadcrumbLinks={breadcrumbLinks}
                buttonColor={'primary'}
                buttonvariant={'variant'}
                onButtonClick={() => navigate(-1)}
                buttonIcon={<IconArrowLeft color='white' />}
            />
            <MainCard title="My Profile Information" icon={<IconUser />}>
                <form onSubmit={handleSubmit}>
                    <Grid container rowSpacing={3} columnSpacing={2}>
                        {/* First Name */}
                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="first_name" sx={labelStyles}>
                                    <MandatoryIndicator label="First Name" isRequired={true} />
                                </InputLabel>
                                <OutlinedInput
                                    id="first_name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="Enter first name"
                                    fullWidth
                                    required
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>

                        {/* Last Name */}
                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="last_name" sx={labelStyles}>
                                    <MandatoryIndicator label="Last Name" isRequired={true} />
                                </InputLabel>
                                <OutlinedInput
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Enter last name"
                                    fullWidth
                                    required
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>

                        {/* Email (Read-only) */}
                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="email" sx={labelStyles}>
                                    Email
                                </InputLabel>
                                <OutlinedInput
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    placeholder="Email"
                                    fullWidth
                                    disabled
                                    sx={{ ...inputStyles, backgroundColor: '#f5f5f5' }}
                                />
                            </Stack>
                        </Grid>

                        {/* Phone */}
                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="phone" sx={labelStyles}>
                                    <MandatoryIndicator label="Phone" isRequired={true} />
                                </InputLabel>
                                <OutlinedInput
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                    fullWidth
                                    required
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>

                        {/* Gender */}
                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="gender" sx={labelStyles}>
                                    Gender
                                </InputLabel>
                                <Select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    displayEmpty
                                    sx={inputStyles}
                                >
                                    <MenuItem value="">
                                        <em>Select Gender</em>
                                    </MenuItem>
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </Stack>
                        </Grid>

                        {/* Date of Birth */}
                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="date_of_birth" sx={labelStyles}>
                                    Date of Birth
                                </InputLabel>
                                <OutlinedInput
                                    id="date_of_birth"
                                    name="date_of_birth"
                                    type="date"
                                    value={formData.date_of_birth}
                                    onChange={handleChange}
                                    fullWidth
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>

                        {/* Employee ID (Read-only) */}
                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="employee_id" sx={labelStyles}>
                                    Employee ID
                                </InputLabel>
                                <OutlinedInput
                                    id="employee_id"
                                    name="employee_id"
                                    value={formData.employee_id}
                                    placeholder="Employee ID"
                                    fullWidth
                                    disabled
                                    sx={{ ...inputStyles, backgroundColor: '#f5f5f5' }}
                                />
                            </Stack>
                        </Grid>

                        {/* Date of Joining (Read-only) */}
                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="date_of_joining" sx={labelStyles}>
                                    Joining Date
                                </InputLabel>
                                <OutlinedInput
                                    id="date_of_joining"
                                    name="date_of_joining"
                                    type="date"
                                    value={formData.date_of_joining}
                                    fullWidth
                                    disabled
                                    sx={{ ...inputStyles, backgroundColor: '#f5f5f5' }}
                                />
                            </Stack>
                        </Grid>

                        {/* Designation */}
                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="designation" sx={labelStyles}>
                                    Designation
                                </InputLabel>
                                <OutlinedInput
                                    id="designation"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    placeholder="Enter designation"
                                    fullWidth
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>

                        {/* Qualifications */}
                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="qualifications" sx={labelStyles}>
                                    Qualifications
                                </InputLabel>
                                <OutlinedInput
                                    id="qualifications"
                                    name="qualifications"
                                    value={formData.qualifications}
                                    onChange={handleChange}
                                    placeholder="Enter qualifications"
                                    fullWidth
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>

                        {/* Address */}
                        <Grid item size={{ xl: 6, lg: 6, md: 6, sm: 12, xs: 12 }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="address" sx={labelStyles}>
                                    Address
                                </InputLabel>
                                <OutlinedInput
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter address"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} mt={4} justifyContent="flex-end">
                        <Grid item>
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                type="submit"
                                color="primary"
                                size="small"
                                disabled={loading}
                            >
                                Update Profile
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </MainCard>
        </>
    );
}
