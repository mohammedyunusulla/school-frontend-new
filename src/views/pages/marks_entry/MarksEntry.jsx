import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip, Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow,
    TextField,
    Typography
} from '@mui/material';
import {
    IconAlertCircle,
    IconDeviceFloppy,
    IconInfoCircle, IconRefresh
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    CLASSES_API_BASE_URL,
    EXAM_API_BASE_URL,
    MARKS_API_BASE_URL,
    SUBJECTS_API_BASE_URL,
} from '../../../ApiConstants';
import { labelStyles } from '../../../AppConstants';
import HeaderCard from '../../../ui-component/cards/HeaderCard';
import MainCard from '../../../ui-component/cards/MainCard';
import EduSphereLoader from '../../../ui-component/EduSphereLoader';
import customAxios from '../../../utils/axiosConfig';

const MarksEntry = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { loggedUser, academicYear } = useSelector(state => ({
        loggedUser: state.globalState?.loggedUser || null,
        academicYear: state.globalState?.academicYear || null
    }));

    // State management
    const [loading, setLoading] = useState(false);
    const [autoSaving, setAutoSaving] = useState(false);

    // Filter states
    const [examTypes, setExamTypes] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [selectedExam, setSelectedExam] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    // Data states
    const [examConfig, setExamConfig] = useState(null);
    const [students, setStudents] = useState([]);
    const [marksData, setMarksData] = useState({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Dialog states
    const [openBulkDialog, setOpenBulkDialog] = useState(false);
    const [bulkMarkValue, setBulkMarkValue] = useState('');
    const [bulkMarkType, setBulkMarkType] = useState('all_absent');

    useEffect(() => {
        fetchExamTypes();
        fetchClasses();

        // Load from navigation state if available
        if (location.state) {
            const { exam_id, class_id, section_id, subject_id } = location.state;
            if (exam_id) setSelectedExam(exam_id);
            if (class_id) setSelectedClass(class_id);
            if (section_id) setSelectedSection(section_id);
            if (subject_id) setSelectedSubject(subject_id);
        }
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchSections(selectedClass);
        }
    }, [selectedClass]);

    useEffect(() => {
        if (selectedSection) {
            fetchSectionSubjects(selectedSection);
        }
    }, [selectedSection]);

    useEffect(() => {
        if (selectedExam && selectedClass && selectedSection && selectedSubject) {
            fetchExamConfigAndStudents();
        }
    }, [selectedExam, selectedClass, selectedSection, selectedSubject, academicYear]);

    // Fetch exam types
    const fetchExamTypes = async () => {
        try {
            const response = await customAxios.get(
                `${EXAM_API_BASE_URL}/fetch/exam-types/${loggedUser?.skid}`
            );
            if (response.data.code === 200) {
                setExamTypes(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching exam types:', error);
        }
    };

    // Fetch classes
    const fetchClasses = async () => {
        try {
            const response = await customAxios.get(
                CLASSES_API_BASE_URL + '/list/' + loggedUser?.skid
            );
            if (response.data.code === 200) {
                setClasses(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    // Fetch sections
    const fetchSections = async (classId) => {
        try {
            const response = await customAxios.get(
                CLASSES_API_BASE_URL + '/sections/' + loggedUser?.skid + '/' + classId
            );
            if (response.data.code === 200) {
                setSections(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    // Fetch subjects
    const fetchSectionSubjects = async (selectedSection) => {
        try {
            const response = await customAxios.get(
                `${SUBJECTS_API_BASE_URL}/section/${loggedUser?.skid}/${selectedSection}`
            );
            if (response.data.code === 200) {
                setSubjects(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    // Fetch exam config and students
    const fetchExamConfigAndStudents = async () => {
        try {
            setLoading(true);

            // Step 1: Fetch exam configurations
            const configResponse = await customAxios.get(
                `${EXAM_API_BASE_URL}/fetch/exam-configs/${loggedUser?.skid}`,
                {
                    params: {
                        exam_type_id: selectedExam,
                        class_id: selectedClass,
                        subject_id: selectedSubject
                        // Don't pass section_id in params - we'll filter in code
                    }
                }
            );

            if (configResponse.data.code === 200) {
                const configs = configResponse.data.data || [];

                if (configs.length === 0) {
                    toast.error('No configuration found for this exam-subject combination. Please configure first.');
                    setExamConfig(null);
                    setStudents([]);
                    setLoading(false);
                    return;
                }

                // FIXED: Find config - prioritize section-specific, fallback to class-level (section_id = null)
                let config = configs.find(c => c.section_id === selectedSection);

                if (!config) {
                    // If no section-specific config, use class-level config (section_id = null)
                    config = configs.find(c => c.section_id === null);
                }

                if (!config) {
                    toast.error('No configuration found for this section or class. Please configure first.');
                    setExamConfig(null);
                    setStudents([]);
                    setLoading(false);
                    return;
                }

                setExamConfig(config);

                // Step 2: Fetch students with marks
                const studentsResponse = await customAxios.post(
                    `${MARKS_API_BASE_URL}/fetch-students/${loggedUser?.skid}/${academicYear?.id}`,
                    {
                        exam_config_id: config.id,
                        section_id: selectedSection
                    }
                );

                if (studentsResponse.data.code === 200) {
                    const studentsData = studentsResponse.data.data || [];

                    if (studentsData.length === 0) {
                        toast.warning('No students found in this section');
                    }

                    setStudents(studentsData);

                    // Initialize marks data
                    const initialMarksData = {};
                    studentsData.forEach(student => {
                        initialMarksData[student.student_id] = {
                            internal_marks: student.existing_marks?.internal_marks || 0,
                            external_marks: student.existing_marks?.external_marks || 0,
                            total_marks: student.existing_marks?.total_marks || 0,
                            is_absent: student.existing_marks?.is_absent || false,
                            remarks: student.existing_marks?.remarks || ''
                        };
                    });
                    setMarksData(initialMarksData);
                    setHasUnsavedChanges(false);
                }
            } else {
                toast.error('Failed to fetch exam configuration');
                setExamConfig(null);
                setStudents([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch exam configuration or students');
            setExamConfig(null);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };


    // Handle marks change
    const handleMarksChange = (studentId, field, value) => {
        setMarksData(prev => {
            const updated = { ...prev };
            const studentMarks = { ...updated[studentId] };

            // Convert to number
            if (field === 'internal_marks' || field === 'external_marks' || field === 'total_marks') {
                studentMarks[field] = Number(value) || 0;
            } else {
                studentMarks[field] = value;
            }

            // Auto-calculate total if internal/external split
            if (examConfig?.has_internal_external && (field === 'internal_marks' || field === 'external_marks')) {
                studentMarks.total_marks = studentMarks.internal_marks + studentMarks.external_marks;
            }

            // Clear marks if absent
            if (field === 'is_absent' && value) {
                studentMarks.internal_marks = 0;
                studentMarks.external_marks = 0;
                studentMarks.total_marks = 0;
            }

            updated[studentId] = studentMarks;
            setHasUnsavedChanges(true);
            return updated;
        });
    };

    // Validate marks
    const validateMarks = (studentMarks) => {
        const errors = [];

        if (examConfig.has_internal_external) {
            if (studentMarks.internal_marks > examConfig.internal_max_marks) {
                errors.push(`Internal marks exceed maximum (${examConfig.internal_max_marks})`);
            }
            if (studentMarks.external_marks > examConfig.external_max_marks) {
                errors.push(`External marks exceed maximum (${examConfig.external_max_marks})`);
            }
        }

        if (studentMarks.total_marks > examConfig.total_max_marks) {
            errors.push(`Total marks exceed maximum (${examConfig.total_max_marks})`);
        }

        return errors;
    };

    // Save draft
    const handleSaveDraft = async () => {
        try {
            setAutoSaving(true);
            await handleSubmitMarks(true);
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            setAutoSaving(false);
        }
    };

    // Submit marks
    const handleSubmitMarks = async (isDraft = false) => {
        try {
            setLoading(true);

            // Prepare marks array
            const marksArray = Object.keys(marksData).map(studentId => ({
                student_id: parseInt(studentId),
                ...marksData[studentId]
            }));

            // Validate all marks
            let hasErrors = false;
            marksArray.forEach((marks, index) => {
                if (!marks.is_absent) {
                    const errors = validateMarks(marks);
                    if (errors.length > 0) {
                        toast.error(`Student ${index + 1}: ${errors.join(', ')}`);
                        hasErrors = true;
                    }
                }
            });

            if (hasErrors) {
                setLoading(false);
                return;
            }

            // Create update same api for entering the marks
            const response = await customAxios.post(
                `${MARKS_API_BASE_URL}/entry/${loggedUser?.skid}/${academicYear?.id}`,
                {
                    exam_config_id: examConfig.id,
                    marks_data: marksArray,
                    is_draft: isDraft,
                    teacher_id: loggedUser?.school_user_id
                }
            );

            if (response.data.code === 200) {
                if (!isDraft) {
                    toast.success('Marks submitted successfully');
                } else {
                    toast.info('Draft saved', { autoClose: 2000 });
                }
                setHasUnsavedChanges(false);
            }
        } catch (error) {
            console.error('Error submitting marks:', error);
            toast.error(error.response?.data?.message || 'Failed to submit marks');
        } finally {
            setLoading(false);
        }
    };

    // Handle bulk operations
    const handleBulkOperation = () => {
        if (bulkMarkType === 'all_absent') {
            const updated = { ...marksData };
            Object.keys(updated).forEach(studentId => {
                updated[studentId] = {
                    ...updated[studentId],
                    is_absent: true,
                    internal_marks: 0,
                    external_marks: 0,
                    total_marks: 0
                };
            });
            setMarksData(updated);
            toast.success('All students marked as absent');
        } else if (bulkMarkType === 'all_present') {
            const updated = { ...marksData };
            Object.keys(updated).forEach(studentId => {
                updated[studentId] = {
                    ...updated[studentId],
                    is_absent: false
                };
            });
            setMarksData(updated);
            toast.success('All students marked as present');
        }
        setOpenBulkDialog(false);
        setHasUnsavedChanges(true);
    };

    // Clear all marks
    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to clear all marks? This cannot be undone.')) {
            const cleared = {};
            students.forEach(student => {
                cleared[student.student_id] = {
                    internal_marks: 0,
                    external_marks: 0,
                    total_marks: 0,
                    is_absent: false,
                    remarks: ''
                };
            });
            setMarksData(cleared);
            setHasUnsavedChanges(true);
            toast.info('All marks cleared');
        }
    };

    // Get pass/fail status
    const getPassFailStatus = (total, isAbsent) => {
        if (isAbsent) return { label: 'Absent', color: 'default' };
        if (total >= examConfig?.min_passing_marks) {
            return { label: 'Pass', color: 'success' };
        }
        return { label: 'Fail', color: 'error' };
    };

    // Calculate statistics
    const calculateStats = () => {
        const present = Object.values(marksData).filter(m => !m.is_absent).length;
        const absent = Object.values(marksData).filter(m => m.is_absent).length;
        const passing = Object.values(marksData).filter(
            m => !m.is_absent && m.total_marks >= examConfig?.min_passing_marks
        ).length;

        return { present, absent, passing };
    };

    const stats = calculateStats();

    const breadcrumbLinks = [
        { title: 'Dashboard', to: '/dashboard' },
        { title: 'Marks Entry', to: '/marks/entry' },
    ];

    return (
        <>
            <EduSphereLoader loading={loading} />
            <HeaderCard
                heading='Marks Entry'
                breadcrumbLinks={breadcrumbLinks}
            />

            <MainCard>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item size={{ xl: 2, lg: 2, md: 3, sm: 6, xs: 12 }}>
                        <Typography sx={labelStyles}>Exam *</Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                value={selectedExam}
                                onChange={(e) => setSelectedExam(e.target.value)}
                                displayEmpty
                            >
                                <MenuItem value="" disabled>Select Exam</MenuItem>
                                {examTypes.map(exam => (
                                    <MenuItem key={exam.id} value={exam.id}>
                                        {exam.exam_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item size={{ xl: 2, lg: 2, md: 3, sm: 6, xs: 12 }}>
                        <Typography sx={labelStyles}>Class *</Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                displayEmpty
                            >
                                <MenuItem value="" disabled>Select Class</MenuItem>
                                {classes.map(cls => (
                                    <MenuItem key={cls.id} value={cls.id}>
                                        {cls.class_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item size={{ xl: 2, lg: 2, md: 3, sm: 6, xs: 12 }}>
                        <Typography sx={labelStyles}>Section *</Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                value={selectedSection}
                                onChange={(e) => setSelectedSection(e.target.value)}
                                disabled={!selectedClass}
                                displayEmpty
                            >
                                <MenuItem value="" disabled>Select Section</MenuItem>
                                {sections.map(section => (
                                    <MenuItem key={section.id} value={section.id}>
                                        {section.section_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item size={{ xl: 2, lg: 2, md: 3, sm: 6, xs: 12 }}>
                        <Typography sx={labelStyles}>Subject *</Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                disabled={!selectedClass}
                                displayEmpty
                            >
                                <MenuItem value="" disabled>Select Subject</MenuItem>
                                {subjects.map(subject => (
                                    <MenuItem key={subject.id} value={subject.id}>
                                        {subject.subject_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                {/* Exam Configuration Info */}
                {examConfig && (
                    <Paper sx={{ p: 2, mb: 2, bgcolor: 'info.lighter' }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <Typography variant="body2">
                                    <strong>Configuration:</strong> Max Marks: {examConfig.total_max_marks} |
                                    Min Passing: {examConfig.min_passing_marks}
                                    {examConfig.has_internal_external &&
                                        ` | Internal: ${examConfig.internal_max_marks} | External: ${examConfig.external_max_marks}`
                                    }
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                                    <Chip label={`Present: ${stats.present}`} size="small" color="success" />
                                    <Chip label={`Absent: ${stats.absent}`} size="small" color="error" />
                                    <Chip label={`Passing: ${stats.passing}`} size="small" color="primary" />
                                </Stack>
                            </Grid>
                        </Grid>
                    </Paper>
                )}

                {/* Marks Entry Table */}
                {students.length > 0 && examConfig && (
                    <Paper sx={{ mb: 2 }}>
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                            <Stack direction="row" spacing={1} justifyContent="space-between" flexWrap="wrap">
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => {
                                            setBulkMarkType('all_absent');
                                            setOpenBulkDialog(true);
                                        }}
                                    >
                                        Mark All Absent
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => {
                                            setBulkMarkType('all_present');
                                            setOpenBulkDialog(true);
                                        }}
                                    >
                                        Mark All Present
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        color="error"
                                        onClick={handleClearAll}
                                    >
                                        Clear All
                                    </Button>
                                </Stack>
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<IconRefresh />}
                                        onClick={fetchExamConfigAndStudents}
                                    >
                                        Refresh
                                    </Button>
                                </Stack>
                            </Stack>
                        </Box>

                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell width={60}>#</TableCell>
                                        <TableCell width={100}>Roll No</TableCell>
                                        <TableCell>Student Name</TableCell>
                                        {examConfig.has_internal_external && (
                                            <>
                                                <TableCell width={120} align="center">
                                                    Internal<br />({examConfig.internal_max_marks})
                                                </TableCell>
                                                <TableCell width={120} align="center">
                                                    External<br />({examConfig.external_max_marks})
                                                </TableCell>
                                            </>
                                        )}
                                        <TableCell width={120} align="center">
                                            Total<br />({examConfig.total_max_marks})
                                        </TableCell>
                                        <TableCell width={80} align="center">Absent</TableCell>
                                        <TableCell width={100} align="center">Status</TableCell>
                                        <TableCell width={200}>Remarks</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {students.map((student, index) => {
                                        const marks = marksData[student.student_id] || {};
                                        const status = getPassFailStatus(marks.total_marks, marks.is_absent);

                                        return (
                                            <TableRow key={student.student_id} hover>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {student.roll_no}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {student.student_name}
                                                    </Typography>
                                                </TableCell>

                                                {examConfig.has_internal_external && (
                                                    <>
                                                        <TableCell align="center">
                                                            <TextField
                                                                type="number"
                                                                size="small"
                                                                value={marks.internal_marks || ''}
                                                                onChange={(e) => handleMarksChange(student.student_id, 'internal_marks', e.target.value)}
                                                                disabled={marks.is_absent}
                                                                inputProps={{
                                                                    max: examConfig.internal_max_marks,
                                                                    min: 0,
                                                                    style: { textAlign: 'center' }
                                                                }}
                                                                sx={{ width: 80 }}
                                                                error={marks.internal_marks > examConfig.internal_max_marks}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <TextField
                                                                type="number"
                                                                size="small"
                                                                value={marks.external_marks || ''}
                                                                onChange={(e) => handleMarksChange(student.student_id, 'external_marks', e.target.value)}
                                                                disabled={marks.is_absent}
                                                                inputProps={{
                                                                    max: examConfig.external_max_marks,
                                                                    min: 0,
                                                                    style: { textAlign: 'center' }
                                                                }}
                                                                sx={{ width: 80 }}
                                                                error={marks.external_marks > examConfig.external_max_marks}
                                                            />
                                                        </TableCell>
                                                    </>
                                                )}

                                                <TableCell align="center">
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={marks.total_marks || ''}
                                                        onChange={(e) => handleMarksChange(student.student_id, 'total_marks', e.target.value)}
                                                        disabled={marks.is_absent || examConfig.has_internal_external}
                                                        inputProps={{
                                                            max: examConfig.total_max_marks,
                                                            min: 0,
                                                            style: { textAlign: 'center' }
                                                        }}
                                                        sx={{ width: 80 }}
                                                        error={marks.total_marks > examConfig.total_max_marks}
                                                    />
                                                </TableCell>

                                                <TableCell align="center">
                                                    <Checkbox
                                                        checked={marks.is_absent || false}
                                                        onChange={(e) => handleMarksChange(student.student_id, 'is_absent', e.target.checked)}
                                                        size="small"
                                                    />
                                                </TableCell>

                                                <TableCell align="center">
                                                    {!marks.is_absent && marks.total_marks > 0 && (
                                                        <Chip
                                                            label={status.label}
                                                            size="small"
                                                            color={status.color}
                                                        />
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        value={marks.remarks || ''}
                                                        onChange={(e) => handleMarksChange(student.student_id, 'remarks', e.target.value)}
                                                        placeholder="Optional"
                                                        fullWidth
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button
                                    variant="outlined"
                                    onClick={() => handleSaveDraft()}
                                    disabled={!hasUnsavedChanges || loading}
                                >
                                    Save Draft
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => handleSubmitMarks(false)}
                                    disabled={loading}
                                    startIcon={<IconDeviceFloppy />}
                                >
                                    Submit Marks
                                </Button>
                            </Stack>
                        </Box>
                    </Paper>
                )}

                {/* Tips Section */}
                {students.length > 0 && (
                    <Alert severity="info" icon={<IconInfoCircle />}>
                        <Typography variant="body2">
                            💡 <strong>Tips:</strong> Press Tab to move to the next field.
                            Changes are auto-saved every 30 seconds.
                            {examConfig?.has_internal_external && ' Total marks are calculated automatically from internal and external marks.'}
                        </Typography>
                    </Alert>
                )}

                {/* Empty State */}
                {!examConfig && selectedExam && selectedClass && selectedSection && selectedSubject && !loading && (
                    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                        <IconAlertCircle size={48} color="gray" />
                        <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
                            No Configuration Found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            This exam-subject combination is not configured yet.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/exam/configure')}
                        >
                            Configure Now
                        </Button>
                    </Paper>
                )}

                {!selectedExam || !selectedClass || !selectedSection || !selectedSubject && (
                    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                        <IconInfoCircle size={48} color="gray" />
                        <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
                            Get Started
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Select exam, class, section, and subject to start entering marks
                        </Typography>
                    </Paper>
                )}
            </MainCard>

            {/* Bulk Operations Dialog */}
            <Dialog open={openBulkDialog} onClose={() => setOpenBulkDialog(false)}>
                <DialogTitle>Confirm Bulk Operation</DialogTitle>
                <DialogContent>
                    <Typography>
                        {bulkMarkType === 'all_absent'
                            ? 'Are you sure you want to mark all students as absent? This will clear all marks.'
                            : 'Are you sure you want to mark all students as present?'
                        }
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBulkDialog(false)}>Cancel</Button>
                    <Button onClick={handleBulkOperation} variant="contained">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default MarksEntry;
