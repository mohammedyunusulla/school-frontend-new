import {
    Box,
    Button,
    Card, CardContent,
    Chip,
    Divider,
    Grid,
    IconButton,
    InputLabel,
    LinearProgress,
    MenuItem,
    Paper,
    Select,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import {
    IconChartBar,
    IconEye,
    IconFileText,
    IconPercentage,
    IconPrinter,
    IconTrophy, IconUsers
} from '@tabler/icons-react';
import { Table } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CLASSES_API_BASE_URL, EXAM_API_BASE_URL, PROGRESS_CARD_API_BASE_URL } from '../../../ApiConstants';
import { inputStyles, labelStyles } from '../../../AppConstants';
import HeaderCard from '../../../ui-component/cards/HeaderCard';
import MainCard from '../../../ui-component/cards/MainCard';
import EduSphereLoader from '../../../ui-component/EduSphereLoader';
import customAxios from '../../../utils/axiosConfig';


const ClassProgressView = () => {
    const navigate = useNavigate();
    const { loggedUser, academicYear } = useSelector(state => ({
        loggedUser: state.globalState?.loggedUser || null,
        academicYear: state.globalState?.academicYear || null
    }));

    const isSchoolAdmin = loggedUser?.role === 'SCHOOL_ADMIN';

    // State management
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [sections, setSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState('');
    const [examTypes, setExamTypes] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [classInfo, setClassInfo] = useState(null);
    const [classStatistics, setClassStatistics] = useState(null);
    const [subjectAnalysis, setSubjectAnalysis] = useState([]);
    const [studentProgress, setStudentProgress] = useState([]);


    // Fetch classes on mount - only for School Admin
    useEffect(() => {
        if (isSchoolAdmin) {
            fetchClasses();
        }
    }, [isSchoolAdmin]);


    // Fetch sections when class changes - only for School Admin
    useEffect(() => {
        if (isSchoolAdmin && selectedClass) {
            fetchSections();
            setSelectedSection(''); // Reset section when class changes
        }
    }, [selectedClass, isSchoolAdmin]);


    // Fetch exam types and class info on mount
    useEffect(() => {
        fetchExamTypes();

        // Only fetch class info for teachers
        if (!isSchoolAdmin) {
            fetchClassInfo();
        }
    }, [isSchoolAdmin]);


    // Fetch class progress based on role
    useEffect(() => {
        if (!selectedExam || !academicYear?.id) return;

        if (isSchoolAdmin) {
            // For School Admin: require class and section selection
            if (selectedClass && selectedSection) {
                fetchClassProgressForAdmin();
            }
        } else {
            // For Teacher: use assigned class info
            if (classInfo) {
                fetchClassProgressForTeacher();
            }
        }
    }, [selectedExam, selectedClass, selectedSection, classInfo, academicYear, isSchoolAdmin]);


    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(CLASSES_API_BASE_URL + '/list/' + loggedUser?.skid);
            if (response.data.code === 200 && response.data.status === 'success') {
                setClasses(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            toast.error('Error fetching classes');
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
            toast.error('Error fetching sections');
        } finally {
            setLoading(false);
        }
    };


    // Fetch exam types
    const fetchExamTypes = async () => {
        try {
            const response = await customAxios.get(
                `${EXAM_API_BASE_URL}/fetch/exam-types/${loggedUser?.skid}`
            );
            if (response.data.code === 200) {
                const activeExams = response.data.data || [];
                setExamTypes(activeExams);
                if (activeExams.length > 0) {
                    setSelectedExam(activeExams[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching exam types:', error);
            toast.error('Failed to fetch exam types');
        }
    };


    // Fetch class teacher's assigned class (only for teachers)
    const fetchClassInfo = async () => {
        try {
            const response = await customAxios.get(
                `${PROGRESS_CARD_API_BASE_URL}/my-class/${loggedUser?.skid}/${loggedUser.school_user_id}`
            );
            if (response.data.code === 200) {
                setClassInfo(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching class info:', error);
            toast.error('No class assigned to you as class teacher');
        }
    };


    // Fetch class progress for School Admin
    const fetchClassProgressForAdmin = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                `${PROGRESS_CARD_API_BASE_URL}/class-progress/${loggedUser?.skid}/${academicYear?.id}/${selectedExam}`,
                {
                    params: {
                        class_id: selectedClass,
                        section_id: selectedSection
                    }
                }
            );

            if (response.data.code === 200) {
                const data = response.data.data;
                setClassStatistics(data.statistics);
                setSubjectAnalysis(data.subject_analysis || []);
                setStudentProgress(data.student_progress || []);
            }
        } catch (error) {
            console.error('Error fetching class progress:', error);
            toast.error('Failed to fetch class progress');
            // Reset data on error
            setClassStatistics(null);
            setSubjectAnalysis([]);
            setStudentProgress([]);
        } finally {
            setLoading(false);
        }
    };


    // Fetch class progress for Teacher
    const fetchClassProgressForTeacher = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                `${PROGRESS_CARD_API_BASE_URL}/class-progress/${loggedUser?.skid}/${academicYear?.id}/${selectedExam}`,
                {
                    params: {
                        class_id: classInfo.class_id,
                        section_id: classInfo.section_id
                    }
                }
            );

            if (response.data.code === 200) {
                const data = response.data.data;
                setClassStatistics(data.statistics);
                setSubjectAnalysis(data.subject_analysis || []);
                setStudentProgress(data.student_progress || []);
            }
        } catch (error) {
            console.error('Error fetching class progress:', error);
            toast.error('Failed to fetch class progress');
        } finally {
            setLoading(false);
        }
    };


    // Handle view individual progress card
    const handleViewProgressCard = (studentId) => {
        navigate(`/progress-card/view/${studentId}/${selectedExam}`);
    };


    // Handle export report
    const handleExportReport = async () => {
        try {
            setLoading(true);

            const classId = isSchoolAdmin ? selectedClass : classInfo.class_id;
            const sectionId = isSchoolAdmin ? selectedSection : classInfo.section_id;

            const response = await customAxios.get(
                `${PROGRESS_CARD_API_BASE_URL}/export/class/${loggedUser?.skid}/${selectedExam}`,
                {
                    params: {
                        class_id: classId,
                        section_id: sectionId
                    },
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const fileName = isSchoolAdmin
                ? `Class_Progress_${selectedClass}_${selectedSection}_${new Date().getTime()}.xlsx`
                : `Class_Progress_${classInfo.class_name}_${classInfo.section_name}_${new Date().getTime()}.xlsx`;

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Report exported successfully');
        } catch (error) {
            console.error('Error exporting report:', error);
            toast.error('Failed to export report');
        } finally {
            setLoading(false);
        }
    };


    // Subject Analysis Table Columns
    const subjectColumns = [
        {
            title: 'Subject',
            dataIndex: 'subject_name',
            key: 'subject_name',
            render: (text, record) => (
                <Box>
                    <Typography variant="body2" fontWeight={500}>
                        {text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {record.subject_code}
                    </Typography>
                </Box>
            ),
        },
        {
            title: 'Max Marks',
            dataIndex: 'max_marks',
            key: 'max_marks',
            width: 100,
            align: 'center',
            render: (marks) => (
                <Typography variant="body2">{marks}</Typography>
            ),
        },
        {
            title: 'Class Average',
            dataIndex: 'average_marks',
            key: 'average_marks',
            width: 120,
            align: 'center',
            render: (avg, record) => {
                const percentage = (avg / record.max_marks * 100).toFixed(1);
                return (
                    <Box>
                        <Typography variant="body2" fontWeight={500}>
                            {avg?.toFixed(1)} ({percentage}%)
                        </Typography>
                    </Box>
                );
            },
        },
        {
            title: 'Highest',
            dataIndex: 'highest_marks',
            key: 'highest_marks',
            width: 100,
            align: 'center',
            render: (marks) => (
                <Chip label={marks} size="small" color="success" />
            ),
        },
        {
            title: 'Lowest',
            dataIndex: 'lowest_marks',
            key: 'lowest_marks',
            width: 100,
            align: 'center',
            render: (marks) => (
                <Chip label={marks} size="small" color="error" />
            ),
        },
        {
            title: 'Pass %',
            dataIndex: 'pass_percentage',
            key: 'pass_percentage',
            width: 100,
            align: 'center',
            render: (percentage) => (
                <Box>
                    <Typography variant="body2" fontWeight={500}>
                        {percentage?.toFixed(1)}%
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                        color={percentage >= 80 ? 'success' : percentage >= 60 ? 'warning' : 'error'}
                    />
                </Box>
            ),
        },
    ];


    // Student Progress Table Columns
    const studentColumns = [
        {
            title: 'Rank',
            dataIndex: 'rank',
            key: 'rank',
            width: 60,
            align: 'center',
            sorter: (a, b) => a.rank - b.rank,
            render: (rank) => {
                let icon = null;
                let color = 'default';
                if (rank === 1) {
                    icon = <IconTrophy size={16} />;
                    color = 'warning';
                }
                return (
                    <Chip
                        label={rank}
                        size="small"
                        color={color}
                        icon={icon}
                    />
                );
            },
        },
        {
            title: 'Roll No',
            dataIndex: 'roll_number',
            key: 'roll_number',
            width: 100,
            sorter: (a, b) => a.roll_number.localeCompare(b.roll_number),
        },
        {
            title: 'Student Name',
            dataIndex: 'student_name',
            key: 'student_name',
            sorter: (a, b) => a.student_name.localeCompare(b.student_name),
            render: (text) => (
                <Typography variant="body2" fontWeight={500}>
                    {text}
                </Typography>
            ),
        },
        {
            title: 'Total Marks',
            dataIndex: 'total_marks',
            key: 'total_marks',
            width: 150,
            align: 'center',
            sorter: (a, b) => a.total_marks - b.total_marks,
            render: (marks, record) => (
                <Typography variant="body2">
                    {marks} / {record.max_marks}
                </Typography>
            ),
        },
        {
            title: 'Percentage',
            dataIndex: 'percentage',
            key: 'percentage',
            width: 120,
            align: 'center',
            sorter: (a, b) => a.percentage - b.percentage,
            render: (percentage) => (
                <Box>
                    <Typography variant="body2" fontWeight={500}>
                        {percentage?.toFixed(2)}%
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                        color={percentage >= 75 ? 'success' : percentage >= 50 ? 'warning' : 'error'}
                    />
                </Box>
            ),
        },
        {
            title: 'Grade',
            dataIndex: 'grade',
            key: 'grade',
            width: 80,
            align: 'center',
            filters: [
                { text: 'A+', value: 'A+' },
                { text: 'A', value: 'A' },
                { text: 'B+', value: 'B+' },
                { text: 'B', value: 'B' },
                { text: 'C', value: 'C' },
                { text: 'D', value: 'D' },
                { text: 'F', value: 'F' },
            ],
            onFilter: (value, record) => record.grade === value,
            render: (grade) => {
                const gradeColors = {
                    'A+': 'success',
                    'A': 'success',
                    'B+': 'info',
                    'B': 'info',
                    'C': 'warning',
                    'D': 'warning',
                    'F': 'error'
                };
                return (
                    <Chip
                        label={grade}
                        size="small"
                        color={gradeColors[grade] || 'default'}
                    />
                );
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            align: 'center',
            filters: [
                { text: 'Pass', value: 'Pass' },
                { text: 'Fail', value: 'Fail' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => (
                <Chip
                    label={status}
                    size="small"
                    color={status === 'Pass' ? 'success' : 'error'}
                />
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Tooltip title="View Progress Card">
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewProgressCard(record.student_id)}
                    >
                        <IconEye size={18} />
                    </IconButton>
                </Tooltip>
            ),
        },
    ];


    const breadcrumbLinks = [
        { title: 'Dashboard', to: '/dashboard' },
        { title: isSchoolAdmin ? 'Class Progress Report' : 'Assigned Class Report', to: '/progress/view' },
    ];


    return (
        <>
            <EduSphereLoader loading={loading} />
            <HeaderCard
                heading={isSchoolAdmin ? "Class Progress Report" : "My Class Progress"}
                breadcrumbLinks={breadcrumbLinks}
                buttonColor={'primary'}
                buttonvariant={'variant'}
            />

            <MainCard>
                {/* Filters Section */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    {/* For school admin select class and section */}
                    {isSchoolAdmin && (
                        <>
                            <Grid item size={{ xl: 2, lg: 2, md: 4, sm: 6, xs: 12 }}>
                                <Stack spacing={1}>
                                    <InputLabel sx={labelStyles}>Select Class *</InputLabel>
                                    <Select
                                        value={selectedClass}
                                        onChange={(e) => {
                                            setSelectedClass(e.target.value);
                                            setSelectedSection('');
                                            setSections([]);
                                            setClassStatistics(null);
                                            setSubjectAnalysis([]);
                                            setStudentProgress([]);
                                        }}
                                        displayEmpty
                                        sx={inputStyles}
                                    >
                                        <MenuItem value="" disabled>Select Class</MenuItem>
                                        {classes.map((cls) => (
                                            <MenuItem key={cls.id} value={cls.id}>
                                                {cls.class_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Stack>
                            </Grid>

                            <Grid item size={{ xl: 2, lg: 2, md: 4, sm: 6, xs: 12 }}>
                                <Stack spacing={1}>
                                    <InputLabel sx={labelStyles}>Select Section *</InputLabel>
                                    <Select
                                        value={selectedSection}
                                        onChange={(e) => {
                                            setSelectedSection(e.target.value);
                                            setClassStatistics(null);
                                            setSubjectAnalysis([]);
                                            setStudentProgress([]);
                                        }}
                                        disabled={!selectedClass}
                                        displayEmpty
                                        sx={inputStyles}
                                    >
                                        <MenuItem value="" disabled>Select Section</MenuItem>
                                        {sections.map((section) => (
                                            <MenuItem key={section.id} value={section.id}>
                                                {section.section_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Stack>
                            </Grid>
                        </>
                    )}

                    <Grid item size={{ xl: 3, lg: 3, md: 3, sm: 6, xs: 12 }}>
                        <Stack spacing={1}>
                            <InputLabel sx={labelStyles}>Select Exam *</InputLabel>
                            <Select
                                value={selectedExam}
                                onChange={(e) => setSelectedExam(e.target.value)}
                                displayEmpty
                                sx={inputStyles}
                            >
                                <MenuItem value="" disabled>Select Exam</MenuItem>
                                {examTypes.map(exam => (
                                    <MenuItem key={exam.id} value={exam.id}>
                                        {exam.exam_name} ({exam.exam_code})
                                    </MenuItem>
                                ))}
                            </Select>
                        </Stack>
                    </Grid>

                    <Grid item xs={12} sm={6} md={isSchoolAdmin ? 5 : 8} display="flex" alignItems="flex-end" gap={2}>
                        <Button
                            variant="outlined"
                            size="medium"
                            startIcon={<IconPrinter />}
                            onClick={() => window.print()}
                            disabled={studentProgress.length === 0}
                        >
                            Print
                        </Button>
                    </Grid>
                </Grid>

                {/* Class Statistics */}
                {classStatistics && (
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.lighter' }}>
                                <Stack alignItems="center" spacing={1}>
                                    <IconUsers size={32} color="#1976d2" />
                                    <Typography variant="h3" color="primary.dark">
                                        {classStatistics.total_students}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Total Students
                                    </Typography>
                                </Stack>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.lighter' }}>
                                <Stack alignItems="center" spacing={1}>
                                    <IconPercentage size={32} color="#2e7d32" />
                                    <Typography variant="h3" color="success.dark">
                                        {classStatistics.class_average?.toFixed(2)}%
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Class Average
                                    </Typography>
                                </Stack>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.lighter' }}>
                                <Stack alignItems="center" spacing={1}>
                                    <IconTrophy size={32} color="#0288d1" />
                                    <Typography variant="h3" color="info.dark">
                                        {classStatistics.pass_count}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Students Passed ({classStatistics.pass_percentage?.toFixed(1)}%)
                                    </Typography>
                                </Stack>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.lighter' }}>
                                <Stack alignItems="center" spacing={1}>
                                    <IconChartBar size={32} color="#ed6c02" />
                                    <Typography variant="h3" color="warning.dark">
                                        {classStatistics.topper_name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Class Topper ({classStatistics.topper_percentage?.toFixed(1)}%)
                                    </Typography>
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                {/* Subject-wise Analysis */}
                {subjectAnalysis.length > 0 && (
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h4" gutterBottom>
                                Subject-wise Analysis
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Table
                                columns={subjectColumns}
                                dataSource={subjectAnalysis}
                                rowKey="subject_id"
                                pagination={false}
                                size="small"
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Student-wise Progress */}
                {studentProgress.length > 0 && (
                    <Card>
                        <CardContent>
                            <Typography variant="h4" gutterBottom>
                                Student-wise Progress
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Table
                                columns={studentColumns}
                                dataSource={studentProgress}
                                rowKey="student_id"
                                pagination={{
                                    pageSize: 20,
                                    showSizeChanger: true,
                                    showTotal: (total) => `Total ${total} students`,
                                }}
                                size="small"
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Empty States */}
                {!isSchoolAdmin && !classInfo && !loading && (
                    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                        <IconUsers size={48} color="gray" />
                        <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
                            No Class Assigned
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            You are not assigned as a class teacher for any class. Please contact administrator.
                        </Typography>
                    </Paper>
                )}

                {isSchoolAdmin && !selectedClass && !loading && (
                    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                        <IconUsers size={48} color="gray" />
                        <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
                            Select Class and Section
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Please select a class and section to view progress report.
                        </Typography>
                    </Paper>
                )}

                {((isSchoolAdmin && selectedClass && selectedSection && selectedExam) ||
                    (!isSchoolAdmin && classInfo && selectedExam)) &&
                    studentProgress.length === 0 && !loading && (
                        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                            <IconFileText size={48} color="gray" />
                            <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
                                No Data Available
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Marks have not been entered yet for this exam. Please ensure all subject teachers have entered marks.
                            </Typography>
                        </Paper>
                    )}
            </MainCard>
        </>
    );
};

export default ClassProgressView;
