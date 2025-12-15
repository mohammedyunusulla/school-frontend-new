import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, IconButton, FormControl, InputLabel, Select, MenuItem,
    Grid, Paper, Stack, Switch, FormControlLabel, Chip,
    Tooltip, Alert, Card, CardContent, CardHeader
} from '@mui/material';
import {
    IconPlus, IconSettings, IconTrash, IconEdit,
    IconInfoCircle, IconCopy, IconCheck, IconAlertCircle,
    IconX
} from '@tabler/icons-react';
import { Table } from 'antd';
import MainCard from '../../../ui-component/cards/MainCard';
import Loader from '../../../ui-component/Loader';
import customAxios from '../../../utils/axiosConfig';
import { EXAM_API_BASE_URL, CLASSES_API_BASE_URL, SUBJECTS_API_BASE_URL } from '../../../ApiConstants';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import HeaderCard from '../../../ui-component/cards/HeaderCard';
import { labelStyles } from '../../../AppConstants';
import EduSphereLoader from '../../../ui-component/EduSphereLoader';

const ExamSubjectConfiguration = () => {
    const navigate = useNavigate();
    const { loggedUser } = useSelector((state) => state.globalState || {});

    // State management
    const [loading, setLoading] = useState(false);

    // Filter states
    const [examTypes, setExamTypes] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]);

    const [selectedExam, setSelectedExam] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');

    // Configuration states
    const [configurations, setConfigurations] = useState([]);
    const [subjectsWithConfig, setSubjectsWithConfig] = useState([]);
    const [openConfigDialog, setOpenConfigDialog] = useState(false);
    const [openBulkCopyDialog, setOpenBulkCopyDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedConfig, setSelectedConfig] = useState(null);

    // Form state with NUMBER types
    const [formData, setFormData] = useState({
        subject_id: '',
        has_internal_external: false,
        internal_max_marks: 0,
        external_max_marks: 0,
        total_max_marks: 100,
        min_passing_marks: 35,
        weightage_percentage: 100.0
    });

    // Bulk copy state
    const [copyFromExam, setCopyFromExam] = useState('');
    const [copyFromClass, setCopyFromClass] = useState('');

    useEffect(() => {
        fetchExamTypes();
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchSections(selectedClass);
            fetchSubjectsForClass(selectedClass);
        } else {
            setAllSubjects([]);
            setSubjectsWithConfig([]);
        }
    }, [selectedClass]);

    useEffect(() => {
        if (selectedExam && selectedClass && allSubjects.length > 0) {
            fetchConfigurations();
        } else {
            setConfigurations([]);
            setSubjectsWithConfig([]);
        }
    }, [selectedExam, selectedClass, selectedSection, allSubjects]);

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
            const response = await customAxios.get(CLASSES_API_BASE_URL + '/list/' + loggedUser?.skid);
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

    // Fetch subjects for class
    const fetchSubjectsForClass = async (classId) => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                `${SUBJECTS_API_BASE_URL}/list/${loggedUser?.skid}/${classId}`
            );
            if (response.data.code === 200) {
                setAllSubjects(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            toast.error('Failed to fetch subjects');
        } finally {
            setLoading(false);
        }
    };

    // Fetch existing configurations and merge with subjects
    const fetchConfigurations = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                `${EXAM_API_BASE_URL}/fetch/exam-configs/${loggedUser?.skid}`,
                {
                    params: {
                        exam_type_id: selectedExam,
                        class_id: selectedClass,
                        section_id: selectedSection || null
                    }
                }
            );

            if (response.data.code === 200) {
                const configs = response.data.data || [];
                setConfigurations(configs);

                // Merge subjects with configurations
                const merged = allSubjects.map(subject => {
                    const config = configs.find(c => c.subject_id === subject.id);
                    return {
                        ...subject,
                        config: config || null,
                        is_configured: !!config
                    };
                });

                setSubjectsWithConfig(merged);
            }
        } catch (error) {
            console.error('Error fetching configurations:', error);
            toast.error('Failed to fetch configurations');
        } finally {
            setLoading(false);
        }
    };

    // Handle filter changes
    const handleExamChange = (value) => {
        setSelectedExam(value);
        setConfigurations([]);
        setSubjectsWithConfig([]);
    };

    const handleClassChange = (value) => {
        setSelectedClass(value);
        setSelectedSection('');
        setSections([]);
        setConfigurations([]);
        setSubjectsWithConfig([]);
    };

    // Open dialog for configuring a subject
    const handleConfigureSubject = (subject) => {
        if (!selectedExam || !selectedClass) {
            toast.warning('Please select exam type and class first');
            return;
        }

        setIsEditMode(false);
        setSelectedSubject(subject);
        setFormData({
            subject_id: subject.id,
            has_internal_external: false,
            internal_max_marks: 0,
            external_max_marks: 0,
            total_max_marks: 100,
            min_passing_marks: 35,
            weightage_percentage: 100.0
        });
        setOpenConfigDialog(true);
    };

    // Open dialog for editing existing config
    const handleEditConfig = (subject) => {
        const config = subject.config;
        setIsEditMode(true);
        setSelectedSubject(subject);
        setSelectedConfig(config);
        setFormData({
            subject_id: subject.id,
            has_internal_external: config.has_internal_external,
            internal_max_marks: Number(config.internal_max_marks) || 0,
            external_max_marks: Number(config.external_max_marks) || 0,
            total_max_marks: Number(config.total_max_marks),
            min_passing_marks: Number(config.min_passing_marks),
            weightage_percentage: Number(config.weightage_percentage) || 100.0
        });
        setOpenConfigDialog(true);
    };

    // Handle form input changes with proper number conversion
    const handleInputChange = (field, value) => {
        setFormData(prev => {
            const updated = { ...prev };

            // Convert to number for numeric fields
            const numericFields = ['internal_max_marks', 'external_max_marks', 'total_max_marks', 'min_passing_marks', 'weightage_percentage'];

            if (numericFields.includes(field)) {
                updated[field] = Number(value) || 0;
            } else {
                updated[field] = value;
            }

            // Auto-calculate total if internal/external split is enabled
            if (field === 'has_internal_external' && !value) {
                updated.internal_max_marks = 0;
                updated.external_max_marks = 0;
            }

            // Auto-calculate total when internal or external changes
            if ((field === 'internal_max_marks' || field === 'external_max_marks') && prev.has_internal_external) {
                updated.total_max_marks = updated.internal_max_marks + updated.external_max_marks;
            }

            return updated;
        });
    };

    // Handle submit
    const handleSubmit = async () => {
        // Validation
        if (!formData.subject_id) {
            toast.warning('Please select a subject');
            return;
        }

        if (formData.total_max_marks <= 0) {
            toast.warning('Total max marks must be greater than 0');
            return;
        }

        if (formData.min_passing_marks >= formData.total_max_marks) {
            toast.warning('Min passing marks must be less than total max marks');
            return;
        }

        if (formData.has_internal_external) {
            const sum = formData.internal_max_marks + formData.external_max_marks;

            if (sum !== formData.total_max_marks) {
                toast.warning(`Internal (${formData.internal_max_marks}) + External (${formData.external_max_marks}) = ${sum} must equal Total marks (${formData.total_max_marks})`);
                return;
            }
        }

        try {
            setLoading(true);

            const payload = {
                exam_type_id: selectedExam,
                class_id: selectedClass,
                section_id: selectedSection || null,
                subject_id: formData.subject_id,
                has_internal_external: formData.has_internal_external,
                internal_max_marks: formData.internal_max_marks,
                external_max_marks: formData.external_max_marks,
                total_max_marks: formData.total_max_marks,
                min_passing_marks: formData.min_passing_marks,
                weightage_percentage: formData.weightage_percentage
            };

            if (isEditMode) {
                const response = await customAxios.put(
                    `${EXAM_API_BASE_URL}/update/exam-config/${loggedUser?.skid}/${selectedConfig.id}`,
                    payload
                );

                if (response.data.code === 200) {
                    toast.success('Configuration updated successfully');
                    fetchConfigurations();
                    setOpenConfigDialog(false);
                }
            } else {
                const response = await customAxios.post(
                    `${EXAM_API_BASE_URL}/create/exam-config/${loggedUser?.skid}`,
                    payload
                );

                if (response.data.code === 200) {
                    toast.success('Configuration created successfully');
                    fetchConfigurations();
                    setOpenConfigDialog(false);
                }
            }
        } catch (error) {
            console.error('Error saving configuration:', error);
            toast.error(error.response?.data?.message || 'Failed to save configuration');
        } finally {
            setLoading(false);
        }
    };

    // Handle delete
    const handleDeleteConfig = async (subject) => {
        if (!window.confirm(`Are you sure you want to delete the configuration for ${subject.subject_name}?`)) {
            return;
        }

        try {
            setLoading(true);
            const response = await customAxios.delete(
                `${EXAM_API_BASE_URL}/delete/exam-config/${loggedUser?.skid}/${subject.config.id}`
            );

            if (response.data.code === 200) {
                toast.success('Configuration deleted successfully');
                fetchConfigurations();
            }
        } catch (error) {
            console.error('Error deleting configuration:', error);
            toast.error('Failed to delete configuration');
        } finally {
            setLoading(false);
        }
    };

    // Handle bulk copy from another exam
    const handleBulkCopy = async () => {
        if (!copyFromExam || !copyFromClass) {
            toast.warning('Please select exam and class to copy from');
            return;
        }

        try {
            setLoading(true);
            const response = await customAxios.post(
                `${EXAM_API_BASE_URL}/bulk-copy/exam-configs/${loggedUser?.skid}`,
                {
                    from_exam_type_id: copyFromExam,
                    from_class_id: copyFromClass,
                    to_exam_type_id: selectedExam,
                    to_class_id: selectedClass,
                    to_section_id: selectedSection || null
                }
            );

            if (response.data.code === 200) {
                toast.success(`Copied ${response.data.data.copied_count} configurations successfully`);
                fetchConfigurations();
                setOpenBulkCopyDialog(false);
            }
        } catch (error) {
            console.error('Error copying configurations:', error);
            toast.error('Failed to copy configurations');
        } finally {
            setLoading(false);
        }
    };

    // Table columns
    const columns = [
        {
            title: 'Subject Name',
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
            title: 'Marking Scheme',
            key: 'marking_scheme',
            render: (_, record) => (
                record.is_configured ? (
                    <Box>
                        {record.config.has_internal_external ? (
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                <Chip label={`Int: ${record.config.internal_max_marks}`} size="small" color="primary" />
                                <Chip label={`Ext: ${record.config.external_max_marks}`} size="small" color="success" />
                            </Stack>
                        ) : (
                            <Chip label="Single" size="small" color="default" />
                        )}
                    </Box>
                ) : (
                    <Typography variant="caption" color="text.disabled">-</Typography>
                )
            ),
        },
        {
            title: 'Min Passing',
            key: 'min_passing',
            // width: 120,
            align: 'center',
            render: (_, record) => (
                record.is_configured ? (
                    <Typography variant="body2">{record.config.min_passing_marks}</Typography>
                ) : (
                    <Typography variant="caption" color="text.disabled">-</Typography>
                )
            ),
        },
        {
            title: 'Total Marks',
            key: 'total_marks',
            // width: 120,
            align: 'center',
            render: (_, record) => (
                record.is_configured ? (
                    <Chip label={record.config.total_max_marks} size="small" color="primary" variant="outlined" />
                ) : (
                    <Typography variant="caption" color="text.disabled">-</Typography>
                )
            ),
        },
        {
            title: 'Weightage',
            key: 'weightage',
            // width: 100,
            align: 'center',
            render: (_, record) => (
                record.is_configured ? (
                    <Typography variant="body2">{record.config.weightage_percentage}%</Typography>
                ) : (
                    <Typography variant="caption" color="text.disabled">-</Typography>
                )
            ),
        },
        {
            title: 'Status',
            key: 'status',
            // width: 120,
            align: 'center',
            filters: [
                { text: 'Configured', value: true },
                { text: 'Not Configured', value: false },
            ],
            onFilter: (value, record) => record.is_configured === value,
            render: (_, record) => (
                record.is_configured ? (
                    <Chip label="Configured" size="small" color="success" icon={<IconCheck size={14} />} />
                ) : (
                    <Chip label="Not Configured" size="small" color="error" icon={<IconX size={14} />} />
                )
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            // width: 150,
            align: 'center',
            render: (_, record) => (
                <Stack direction="row" spacing={1} justifyContent="center">
                    {record.is_configured ? (
                        <>
                            <Tooltip title="Edit Configuration">
                                <IconButton size="small" color="primary" onClick={() => handleEditConfig(record)}>
                                    <IconEdit size={18} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Configuration">
                                <IconButton size="small" color="error" onClick={() => handleDeleteConfig(record)}>
                                    <IconTrash size={18} />
                                </IconButton>
                            </Tooltip>
                        </>
                    ) : (
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<IconSettings size={18} />}
                            onClick={() => handleConfigureSubject(record)}
                        >
                            Configure
                        </Button>
                    )}
                </Stack>
            ),
        },
    ];

    const breadcrumbLinks = [
        { title: 'Dashboard', to: '/dashboard' },
        { title: 'Exam Subject Configuration', to: '/exams/subjects' },
    ];

    return (
        <>
            <EduSphereLoader loading={loading} />
            <HeaderCard
                heading={'Exam Subject Configuration'}
                breadcrumbLinks={breadcrumbLinks}
                buttonColor={'primary'}
                buttonvariant={'contained'}
                buttonText="Exam Configs"
                onButtonClick={() => navigate('/exams/types')}
                buttonIcon={<IconPlus size={20} />}
            />
            <MainCard>
                <Grid container spacing={2}>
                    <Grid item size={{ xl: 2, lg: 2, md: 4, sm: 6, xs: 12 }}>
                        <Stack spacing={1}>
                            <InputLabel sx={labelStyles}>Exam Type *</InputLabel>
                            <Select
                                value={selectedExam}
                                onChange={(e) => handleExamChange(e.target.value)}
                                size='small'
                            >
                                {examTypes.map(exam => (
                                    <MenuItem key={exam.id} value={exam.id}>
                                        {exam.exam_name} ({exam.exam_code})
                                    </MenuItem>
                                ))}
                            </Select>
                        </Stack>
                    </Grid>

                    <Grid item size={{ xl: 2, lg: 2, md: 4, sm: 6, xs: 12 }}>
                        <Stack spacing={1}>
                            <InputLabel sx={labelStyles}>Class *</InputLabel>
                            <Select
                                size='small'
                                value={selectedClass}
                                onChange={(e) => handleClassChange(e.target.value)}
                            >
                                {classes.map(cls => (
                                    <MenuItem key={cls.id} value={cls.id}>
                                        {cls.class_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Stack>
                    </Grid>

                    <Grid item size={{ xl: 2, lg: 2, md: 4, sm: 6, xs: 12 }}>
                        <Stack spacing={1}>
                            <InputLabel sx={labelStyles}>Section (Optional)</InputLabel>
                            <Select
                                size='small'
                                value={selectedSection}
                                onChange={(e) => setSelectedSection(e.target.value)}
                                disabled={!selectedClass}
                            >
                                <MenuItem value="">All Sections</MenuItem>
                                {sections.map(section => (
                                    <MenuItem key={section.id} value={section.id}>
                                        {section.section_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Stack>
                    </Grid>
                </Grid>
                <br />
                {selectedExam && selectedClass && (
                    <>
                        <Stack direction="row" spacing={4} flexWrap="wrap">
                            <Alert severity="info"  >
                                <Typography variant="body2">
                                    Configuring for: <strong>{examTypes.find(e => e.id === selectedExam)?.exam_name}</strong> -
                                    <strong> {classes.find(c => c.id === selectedClass)?.class_name}</strong>
                                    {selectedSection && ` - ${sections.find(s => s.id === selectedSection)?.section_name}`}
                                </Typography>
                            </Alert>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<IconCopy size={18} />}
                                onClick={() => setOpenBulkCopyDialog(true)}
                            >
                                Bulk Copy
                            </Button>
                        </Stack>
                        <br />
                    </>
                )}

                {/* Step 2: Subjects Configuration Table */}
                {(selectedExam && selectedClass && subjectsWithConfig.length > 0) && (
                    <>
                        <Table
                            columns={columns}
                            dataSource={subjectsWithConfig}
                            rowKey="id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Total ${total} subjects`,
                            }}
                            size="small"
                        />
                    </>
                )}

                {/* Empty State */}
                {selectedExam && selectedClass && subjectsWithConfig.length === 0 && (
                    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                        <IconAlertCircle size={48} color="gray" />
                        <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
                            No Subjects Found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            No subjects are assigned to this class. Please add subjects to the class first.
                        </Typography>
                    </Paper>
                )}

                {/* Info Section */}
                {!selectedExam || !selectedClass && (
                    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                        <IconInfoCircle size={48} color="gray" />
                        <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
                            Get Started
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Select an exam type and class to view and configure subject marking schemes
                        </Typography>
                    </Paper>
                )}
            </MainCard>

            {/* Configuration Dialog */}
            <Dialog
                open={openConfigDialog}
                onClose={() => setOpenConfigDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {isEditMode ? 'Edit' : 'Configure'} Subject: {selectedSubject?.subject_name}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    <Typography variant="body2">
                                        <strong>Subject:</strong> {selectedSubject?.subject_name} ({selectedSubject?.subject_code})
                                    </Typography>
                                </Alert>
                            </Grid>

                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.has_internal_external}
                                            onChange={(e) => handleInputChange('has_internal_external', e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label="Has Internal/External Split"
                                />
                            </Grid>

                            {formData.has_internal_external && (
                                <>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Internal Max Marks"
                                            type="number"
                                            value={formData.internal_max_marks}
                                            onChange={(e) => handleInputChange('internal_max_marks', e.target.value)}
                                            InputProps={{ inputProps: { min: 0 } }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="External Max Marks"
                                            type="number"
                                            value={formData.external_max_marks}
                                            onChange={(e) => handleInputChange('external_max_marks', e.target.value)}
                                            InputProps={{ inputProps: { min: 0 } }}
                                        />
                                    </Grid>
                                </>
                            )}

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Total Max Marks"
                                    type="number"
                                    value={formData.total_max_marks}
                                    onChange={(e) => handleInputChange('total_max_marks', e.target.value)}
                                    InputProps={{ inputProps: { min: 1 } }}
                                    disabled={formData.has_internal_external}
                                    helperText={formData.has_internal_external ? "Auto-calculated" : ""}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Min Passing Marks"
                                    type="number"
                                    value={formData.min_passing_marks}
                                    onChange={(e) => handleInputChange('min_passing_marks', e.target.value)}
                                    InputProps={{ inputProps: { min: 0 } }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Weightage Percentage"
                                    type="number"
                                    value={formData.weightage_percentage}
                                    onChange={(e) => handleInputChange('weightage_percentage', e.target.value)}
                                    InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
                                    helperText="Used for calculating final grades"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Alert severity="info" icon={<IconInfoCircle />}>
                                    <Typography variant="caption">
                                        💡 <strong>Tip:</strong> Enable Internal/External split for exams that have separate
                                        internal assessments and external examinations. The system will automatically
                                        calculate the total marks.
                                    </Typography>
                                </Alert>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenConfigDialog(false)} variant="outlined" disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                        {isEditMode ? 'Update' : 'Save'} Configuration
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Copy Dialog */}
            <Dialog
                open={openBulkCopyDialog}
                onClose={() => setOpenBulkCopyDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <IconCopy size={24} />
                        <span>Bulk Copy Configurations</span>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        This will copy all subject configurations from the selected exam and class
                        to the current selection. Existing configurations will not be overwritten.
                    </Alert>
                    <Grid container spacing={2}>
                        <Grid item size={{ xl: 6, lg: 6, md: 6, sm: 12, xs: 12 }}>
                            <FormControl fullWidth>
                                <InputLabel>Copy From Exam *</InputLabel>
                                <Select
                                    value={copyFromExam}
                                    onChange={(e) => setCopyFromExam(e.target.value)}
                                    label="Copy From Exam *"
                                >
                                    {examTypes.filter(e => e.id !== selectedExam).map(exam => (
                                        <MenuItem key={exam.id} value={exam.id}>
                                            {exam.exam_name} ({exam.exam_code})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item size={{ xl: 6, lg: 6, md: 6, sm: 12, xs: 12 }}>
                            <FormControl fullWidth>
                                <InputLabel>Copy From Class *</InputLabel>
                                <Select
                                    value={copyFromClass}
                                    onChange={(e) => setCopyFromClass(e.target.value)}
                                    label="Copy From Class *"
                                >
                                    {classes.map(cls => (
                                        <MenuItem key={cls.id} value={cls.id}>
                                            {cls.class_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item size={{ xl: 12, lg: 12, md: 14, sm: 12, xs: 12 }}>
                            <Paper sx={{ p: 2, bgcolor: 'info.lighter' }}>
                                <Typography variant="body2">
                                    <strong>Current Selection:</strong> &nbsp;
                                    Exam: {examTypes.find(e => e.id === selectedExam)?.exam_name} /
                                    Class: {classes.find(c => c.id === selectedClass)?.class_name}
                                    {selectedSection && ` - ${sections.find(s => s.id === selectedSection)?.section_name}`}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenBulkCopyDialog(false)} variant="outlined" color='error' size='small'>
                        Cancel
                    </Button>
                    <Button
                        size='small'
                        onClick={handleBulkCopy}
                        variant="contained"
                        disabled={loading || !copyFromExam || !copyFromClass}
                    >
                        Copy Configurations
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ExamSubjectConfiguration;
