import {
    Alert, Box, Button, Chip, Grid, InputLabel, MenuItem, OutlinedInput,
    Select, Snackbar, Stack, TextField, Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';
import { Table } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ATTENDANCE_API_BASE_URL, CLASSES_API_BASE_URL, STUDENTS_API_BASE_URL } from '../../../ApiConstants';
import HeaderCard from '../../../ui-component/cards/HeaderCard';
import MainCard from '../../../ui-component/cards/MainCard';
import EduSphereLoader from '../../../ui-component/EduSphereLoader';
import customAxios from '../../../utils/axiosConfig';

const labelStyles = {
    fontSize: '14px',
    fontWeight: 500,
    color: 'text.primary'
};

const AttendanceMark = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { loggedUser, academicYear } = useSelector(state => ({
        loggedUser: state.globalState?.loggedUser || null,
        academicYear: state.globalState?.academicYear || null
    }));
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [sections, setSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState(null);
    const [date, setDate] = useState(dayjs());
    const [students, setStudents] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [existingAttendance, setExistingAttendance] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [urlParamsLoaded, setUrlParamsLoaded] = useState(false);
    const [pendingSectionId, setPendingSectionId] = useState(null);

    // Step 1: Load classes first
    useEffect(() => {
        fetchClasses();
    }, []);

    // Step 2: Handle URL parameters and set initial values
    useEffect(() => {
        const classParam = searchParams.get('class');
        const sectionParam = searchParams.get('section');
        const dateParam = searchParams.get('date');

        if (classParam && classes.length > 0) {
            const classId = parseInt(classParam);
            setSelectedClass(classId);

            // Store section ID to set after sections are loaded
            if (sectionParam) {
                setPendingSectionId(parseInt(sectionParam));
            }
        }

        if (dateParam) {
            setDate(dayjs(dateParam));
        }

        setUrlParamsLoaded(true);
    }, [searchParams, classes]);

    // Step 3: Fetch sections when class changes
    useEffect(() => {
        if (selectedClass) {
            fetchSections();
        } else {
            setSections([]);
            setSelectedSection(null);
        }
    }, [selectedClass]);

    // Step 4: Set section once sections are loaded
    useEffect(() => {
        if (pendingSectionId && sections.length > 0) {
            const sectionExists = sections.find(s => s.id === pendingSectionId);
            if (sectionExists) {
                setSelectedSection(pendingSectionId);
                setPendingSectionId(null); // Clear pending section
            }
        }
    }, [sections, pendingSectionId]);

    // Step 5: Reset attendance data when section or date changes
    useEffect(() => {
        if (selectedSection && date) {
            resetAttendanceData();
        }
    }, [selectedSection, date]);

    // Step 6: Auto-fetch students if all parameters are set (for edit mode)
    useEffect(() => {
        if (urlParamsLoaded && selectedClass && selectedSection && date && attendanceRecords.length === 0) {
            const timeout = setTimeout(() => {
                fetchStudents();
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [urlParamsLoaded, selectedClass, selectedSection, date]);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(CLASSES_API_BASE_URL + '/list/' + loggedUser?.skid);
            if (response.data.code === 200 && response.data.status === 'success') {
                setClasses(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            setSnackbar({ open: true, message: 'Error fetching classes', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchSections = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                CLASSES_API_BASE_URL + '/sections/' + loggedUser?.skid + '/' + selectedClass
            );
            if (response.data.code === 200 && response.data.status === 'success') {
                setSections(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
            setSnackbar({ open: true, message: 'Error fetching sections', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        if (!selectedSection) {
            setSnackbar({ open: true, message: 'Please select a section first', severity: 'warning' });
            return;
        }

        try {
            setLoading(true);
            const response = await customAxios.get(
                STUDENTS_API_BASE_URL + '/list/inSection/' + loggedUser?.skid + '/' + academicYear?.id + '/' + selectedSection
            );

            if (response.data.code === 200 && response.data.status === 'success') {
                const studentsList = response.data.data || [];
                setStudents(studentsList);
                await checkExistingAttendance(studentsList);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            setSnackbar({ open: true, message: 'Error fetching students', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const checkExistingAttendance = async (studentsList) => {
        try {
            const formattedDate = date.format('YYYY-MM-DD');
            const response = await customAxios.get(`${ATTENDANCE_API_BASE_URL}/view/${loggedUser?.skid}/${academicYear?.id}`, {
                params: {
                    class_id: selectedClass,
                    section_id: selectedSection,
                    date: formattedDate
                }
            });

            if (response.data.code === 200 && response.data.data.records.length > 0) {
                // Attendance exists - Edit Mode
                const existingRecords = response.data.data.records;
                setExistingAttendance(existingRecords);
                setIsEditMode(true);

                // Map existing attendance to students
                const mappedRecords = studentsList.map((student) => {
                    const existingRecord = existingRecords.find((r) => r.student.id === student.id);
                    return {
                        id: student.id,
                        full_name: student.full_name,
                        profile: student.profile,
                        status: existingRecord?.status || 'Present',
                        remarks: existingRecord?.remarks || '',
                        attendance_id: existingRecord?.id || null
                    };
                });

                setAttendanceRecords(mappedRecords);
                setSnackbar({
                    open: true,
                    message: 'Existing attendance loaded for editing',
                    severity: 'info'
                });
            } else {
                // No attendance - New Mode
                setIsEditMode(false);
                const newRecords = studentsList.map((student) => ({
                    id: student.id,
                    full_name: student.full_name,
                    profile: student.profile,
                    status: 'Present',
                    remarks: ''
                }));
                setAttendanceRecords(newRecords);
            }
        } catch (error) {
            console.error('Error checking existing attendance:', error);
            // If error, create new records
            setIsEditMode(false);
            const newRecords = studentsList.map((student) => ({
                id: student.id,
                full_name: student.full_name,
                profile: student.profile,
                status: 'Present',
                remarks: ''
            }));
            setAttendanceRecords(newRecords);
        }
    };

    const resetAttendanceData = () => {
        setStudents([]);
        setAttendanceRecords([]);
        setIsEditMode(false);
        setExistingAttendance([]);
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceRecords((prev) =>
            prev.map((record) => (record.id === studentId ? { ...record, status } : record))
        );
    };

    const handleRemarksChange = (studentId, remarks) => {
        setAttendanceRecords((prev) =>
            prev.map((record) => (record.id === studentId ? { ...record, remarks } : record))
        );
    };

    const handleSubmit = async () => {
        if (!selectedSection || attendanceRecords.length === 0) {
            setSnackbar({ open: true, message: 'Please select section and fetch students first', severity: 'warning' });
            return;
        }

        setLoading(true);
        try {
            const recordsToSubmit = attendanceRecords.map((record) => ({
                student_id: record.id,
                class_id: selectedClass,
                section_id: selectedSection,
                status: record.status,
                remarks: record.remarks,
                date: date.format('YYYY-MM-DD'),
                attendance_id: record.attendance_id || null
            }));

            const endpoint = isEditMode
                ? `${ATTENDANCE_API_BASE_URL}/update/bulk/${loggedUser?.skid}`
                : `${ATTENDANCE_API_BASE_URL}/record/bulk/${loggedUser?.skid}`;

            const response = await customAxios.post(endpoint, {
                records: recordsToSubmit,
                date: date.format('YYYY-MM-DD'),
                section_id: selectedSection,
                academic_year_id: academicYear?.id
            });

            if (response.data.code === 200) {
                setSnackbar({
                    open: true,
                    message: isEditMode ? 'Attendance updated successfully' : 'Attendance recorded successfully',
                    severity: 'success'
                });
                navigate(-1);
            } else {
                throw new Error('Failed to save attendance');
            }
        } catch (error) {
            console.error('Error saving attendance:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Error saving attendance',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllPresent = () => {
        setAttendanceRecords((prev) => prev.map((record) => ({ ...record, status: 'Present' })));
    };

    const handleMarkAllAbsent = () => {
        setAttendanceRecords((prev) => prev.map((record) => ({ ...record, status: 'Absent' })));
    };

    const getAttendanceSummary = () => {
        const total = attendanceRecords.length;
        const present = attendanceRecords.filter((r) => r.status === 'Present').length;
        const absent = attendanceRecords.filter((r) => r.status === 'Absent').length;
        const leave = attendanceRecords.filter((r) => r.status === 'Leave').length;
        const late = attendanceRecords.filter((r) => r.status === 'Late').length;

        return { total, present, absent, leave, late };
    };

    const columns = [
        {
            title: 'S.No',
            key: 'sno',
            width: 60,
            render: (_, __, index) => index + 1
        },
        {
            title: 'Student Name',
            key: 'name',
            dataIndex: 'full_name'
        },
        {
            title: 'Roll No.',
            dataIndex: ['profile', 'roll_no'],
            key: 'roll_no',
            width: 150,
            render: (rollNo) => rollNo || '-'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 170,
            render: (_, record) => (
                <Select
                    value={record.status}
                    onChange={(e) => handleStatusChange(record.id, e.target.value)}
                    size="small"
                    fullWidth
                >
                    <MenuItem value="Present">Present</MenuItem>
                    <MenuItem value="Absent">Absent</MenuItem>
                    <MenuItem value="Late">Late</MenuItem>
                    <MenuItem value="Leave">Leave</MenuItem>
                </Select>
            )
        },
        {
            title: 'Remarks',
            dataIndex: 'remarks',
            key: 'remarks',
            render: (_, record) => (
                <TextField
                    value={record.remarks || ''}
                    onChange={(e) => handleRemarksChange(record.id, e.target.value)}
                    size="small"
                    fullWidth
                    placeholder="Optional remarks"
                />
            )
        }
    ];

    const summary = getAttendanceSummary();

    const breadcrumbLinks = [
        { title: 'Dashboard', to: '/dashboard' },
        { title: 'View Attendance Records', to: '/attendance/view' },
        {
            title: (isEditMode ? "Edit Attendance" : "Mark Attendance"),
            to: (isEditMode ? '/attendance/mark' : '/attendance/mark')
        },
    ];

    return (
        <>
            <EduSphereLoader loading={loading} />
            <HeaderCard
                heading={"Mark Attendance"}
                breadcrumbLinks={breadcrumbLinks}
                buttonColor={'primary'}
                buttonvariant={'variant'}
                onButtonClick={() => navigate(-1)}
                buttonIcon={<IconArrowLeft color='white' />}
            />
            <MainCard>
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid item size={{ xl: 3, lg: 3, md: 3, sm: 6, xs: 6 }}>
                        <Stack spacing={1}>
                            <InputLabel sx={labelStyles}>Select Class</InputLabel>
                            <Select
                                value={selectedClass || ''}
                                onChange={(e) => {
                                    setSelectedClass(e.target.value);
                                    setSelectedSection(null); // Reset section when class changes
                                }}
                                displayEmpty
                                size={isMobile ? 'small' : 'default'}
                            >
                                <MenuItem value="">
                                    <em>Select Class</em>
                                </MenuItem>
                                {classes.map((cls) => (
                                    <MenuItem key={cls.id} value={cls.id}>
                                        {cls.class_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Stack>
                    </Grid>

                    <Grid item size={{ xl: 3, lg: 3, md: 3, sm: 6, xs: 6 }}>
                        <Stack spacing={1}>
                            <InputLabel sx={labelStyles}>Select Section</InputLabel>
                            <Select
                                value={selectedSection || ''}
                                onChange={(e) => setSelectedSection(e.target.value)}
                                disabled={!selectedClass}
                                displayEmpty
                                size={isMobile ? 'small' : 'default'}
                            >
                                <MenuItem value="">
                                    <em>{!selectedClass ? 'Select Class first' : 'Select Section'}</em>
                                </MenuItem>
                                {sections.map((sec) => (
                                    <MenuItem key={sec.id} value={sec.id}>
                                        {sec.section_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Stack>
                    </Grid>

                    <Grid item size={{ xl: 3, lg: 3, md: 3, sm: 6, xs: 6 }}>
                        <Stack spacing={1}>
                            <InputLabel sx={labelStyles}>Attendance Date</InputLabel>
                            <OutlinedInput
                                type="date"
                                value={date.format('YYYY-MM-DD')}
                                onChange={(e) => setDate(dayjs(e.target.value))}
                                size={isMobile ? 'small' : 'default'}
                            />
                        </Stack>
                    </Grid>

                    <Grid item size={{ xl: 3, lg: 3, md: 3, sm: 6, xs: 6 }}>
                        <Button variant="contained" onClick={fetchStudents} disabled={loading || !selectedSection} fullWidth>
                            {loading ? 'Loading...' : 'Fetch Students'}
                        </Button>
                    </Grid>
                </Grid>

                {attendanceRecords.length > 0 && (
                    <>
                        <Box sx={{ mt: { xs: 2, sm: 3 }, mb: 2, px: { xs: 2, sm: 0 } }}>
                            <Alert
                                severity={isEditMode ? 'warning' : 'info'}
                                sx={{
                                    mb: 2,
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                }}
                            >
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={1}
                                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                                >
                                    <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                        Attendance for {date.format(isMobile ? 'DD/MM/YY' : 'DD/MM/YYYY')}
                                    </Typography>
                                    {isEditMode && (
                                        <Chip
                                            label="EDIT MODE"
                                            color="error"
                                            size="small"
                                            sx={{
                                                height: { xs: 20, sm: 24 },
                                                fontSize: { xs: '0.65rem', sm: '0.75rem' }
                                            }}
                                        />
                                    )}
                                </Stack>
                            </Alert>

                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={{ xs: 1.5, sm: 2 }}
                                alignItems={{ xs: 'stretch', sm: 'center' }}
                                justifyContent={{ xs: 'flex-start', sm: 'space-between' }}
                            >
                                {/* Summary Chips */}
                                <Stack
                                    direction="row"
                                    spacing={{ xs: 1, sm: 2 }}
                                    flexWrap="wrap"
                                    useFlexGap
                                    sx={{
                                        '& > *': {
                                            mb: { xs: 1, sm: 0 }
                                        }
                                    }}
                                >
                                    <Chip
                                        label={`Total: ${summary.total}`}
                                        variant="outlined"
                                        size={isMobile ? "small" : "medium"}
                                        sx={{
                                            fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                                            height: { xs: 24, sm: 32 }
                                        }}
                                    />
                                    <Chip
                                        label={`Present: ${summary.present}`}
                                        color="success"
                                        size={isMobile ? "small" : "medium"}
                                        sx={{
                                            fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                                            height: { xs: 24, sm: 32 }
                                        }}
                                    />
                                    <Chip
                                        label={`Absent: ${summary.absent}`}
                                        color="error"
                                        size={isMobile ? "small" : "medium"}
                                        sx={{
                                            fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                                            height: { xs: 24, sm: 32 }
                                        }}
                                    />
                                    <Chip
                                        label={`Late: ${summary.late}`}
                                        color="warning"
                                        size={isMobile ? "small" : "medium"}
                                        sx={{
                                            fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                                            height: { xs: 24, sm: 32 }
                                        }}
                                    />
                                    <Chip
                                        label={`Leave: ${summary.leave}`}
                                        color="info"
                                        size={isMobile ? "small" : "medium"}
                                        sx={{
                                            fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                                            height: { xs: 24, sm: 32 }
                                        }}
                                    />
                                </Stack>

                                {/* Action Buttons */}
                                <Stack
                                    direction={'row'}
                                    spacing={1}
                                    sx={{
                                        width: { xs: '100%', sm: 'auto' },
                                        mt: { xs: 1, sm: 0 }
                                    }}
                                >
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={handleMarkAllPresent}
                                        fullWidth={isMobile}
                                        sx={{
                                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {isMobile ? 'All Present' : 'Mark All Present'}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={handleMarkAllAbsent}
                                        fullWidth={isMobile}
                                        sx={{
                                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {isMobile ? 'All Absent' : 'Mark All Absent'}
                                    </Button>
                                </Stack>
                            </Stack>
                        </Box>

                        <Table
                            columns={columns}
                            dataSource={attendanceRecords}
                            rowKey="id"
                            pagination={false}
                            bordered
                            size="small"
                            scroll={{ x: 400 }}
                        />

                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button variant="contained" onClick={handleSubmit} disabled={loading} size="large">
                                {loading ? 'Saving...' : isEditMode ? 'Update Attendance' : 'Save Attendance'}
                            </Button>
                        </Box>
                    </>
                )}

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert
                        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                        variant="filled"
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </MainCard >
        </>
    );
};

export default AttendanceMark;
