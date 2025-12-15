import {
    Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent,
    DialogTitle, Divider, FormControl, InputLabel, MenuItem, Select, Stack, Typography
} from '@mui/material';
import { IconTrendingUp } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { CLASSES_API_BASE_URL, STUDENTS_API_BASE_URL } from '../../../ApiConstants';
import customAxios from '../../../utils/axiosConfig';

function PromoteStudents({
    loggedUser,
    open,
    onClose,
    selectedStudents = [],
    currentClass,
    currentSection,
    currentAcademicYear,
    onPromotionSuccess
}) {
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);

    const [targetClassId, setTargetClassId] = useState(null);
    const [targetSectionId, setTargetSectionId] = useState(null);
    const [targetAcademicYearId, setTargetAcademicYearId] = useState(null);
    const [promotionStatus, setPromotionStatus] = useState('PROMOTED');

    // Fetch classes on mount
    useEffect(() => {
        if (open && loggedUser?.skid) {
            fetchClasses();
        }
    }, [open, loggedUser?.skid]);

    // Fetch sections when target class changes
    useEffect(() => {
        if (targetClassId) {
            fetchSections();
        } else {
            setSections([]);
            setTargetSectionId(null);
        }
    }, [targetClassId]);

    const fetchClasses = async () => {
        try {
            const response = await customAxios.get(`${CLASSES_API_BASE_URL}/list/${loggedUser?.skid}`);
            if (response.data.code === 200 && response.data.status === 'success') {
                setClasses(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            toast.error('Failed to fetch classes');
        }
    };

    const fetchSections = async () => {
        try {
            const response = await customAxios.get(
                `${CLASSES_API_BASE_URL}/sections/${loggedUser?.skid}/${targetClassId}`
            );
            if (response.data.code === 200 && response.data.status === 'success') {
                setSections(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
            toast.error('Failed to fetch sections');
        }
    };

    const handlePromote = async () => {
        if (!targetClassId || !targetSectionId || !targetAcademicYearId) {
            toast.warning('Please select target class, section, and academic year');
            return;
        }

        if (selectedStudents.length === 0) {
            toast.warning('No students selected for promotion');
            return;
        }

        try {
            setLoading(true);

            const payload = {
                student_ids: selectedStudents.map((s) => s.id),
                from_class_id: currentClass?.id,
                from_section_id: currentSection?.id,
                from_academic_year_id: currentAcademicYear?.id,
                to_class_id: targetClassId,
                to_section_id: targetSectionId,
                to_academic_year_id: targetAcademicYearId,
                promotion_date: new Date().toISOString().slice(0, 10),
                default_status: promotionStatus,
                remarks: `Promoted from ${currentClass?.class_name}-${currentSection?.section_name} (${currentAcademicYear?.year_name})`
            };

            const response = await customAxios.post(
                `${STUDENTS_API_BASE_URL}/promote/${loggedUser?.skid}`,
                payload
            );

            if (response.data.code === 200 && response.data.status === 'success') {
                toast.success(response.data.message || 'Students promoted successfully');
                onPromotionSuccess && onPromotionSuccess();
                handleClose();
            } else {
                toast.error(response.data.message || 'Failed to promote students');
            }
        } catch (error) {
            console.error('Error promoting students:', error);
            toast.error(error.response?.data?.message || 'Failed to promote students');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setTargetClassId(null);
        setTargetSectionId(null);
        setTargetAcademicYearId(null);
        setPromotionStatus('PROMOTED');
        onClose();
    };

    const targetClass = classes.find((c) => c.id === targetClassId);
    const targetSection = sections.find((s) => s.id === targetSectionId);
    const targetYear = academicYears.find((y) => y.id === targetAcademicYearId);

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconTrendingUp size={24} />
                Promote Students
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    {/* Summary Box */}
                    <Alert severity="info" sx={{ mb: 1 }}>
                        <Typography variant="body2">
                            <span>Promoting <strong>{selectedStudents.length} student(s)</strong> from{' '}</span>

                            <Chip
                                label={`${currentClass?.class_name} - ${currentSection?.section_name}`}
                                size="small"
                                color="primary"
                                sx={{ mx: 0.5 }}
                            />{' '}
                            ({currentAcademicYear?.year_name})
                        </Typography>
                    </Alert>

                    {/* Target Class */}
                    <FormControl fullWidth size="small">
                        <InputLabel id="target-class-label">Target Class</InputLabel>
                        <Select
                            labelId="target-class-label"
                            value={targetClassId || ''}
                            label="Target Class"
                            onChange={(e) => {
                                setTargetClassId(e.target.value);
                                setTargetSectionId(null);
                            }}
                        >
                            {classes.length === 0 ? (
                                <MenuItem disabled>No classes available</MenuItem>
                            ) : (
                                classes.map((cls) => (
                                    <MenuItem key={cls.id} value={cls.id}>
                                        {cls.class_name}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>

                    {/* Target Section */}
                    <FormControl fullWidth size="small" disabled={!targetClassId}>
                        <InputLabel id="target-section-label">Target Section</InputLabel>
                        <Select
                            labelId="target-section-label"
                            value={targetSectionId || ''}
                            label="Target Section"
                            onChange={(e) => setTargetSectionId(e.target.value)}
                        >
                            {sections.length === 0 ? (
                                <MenuItem disabled>
                                    {targetClassId ? 'No sections available' : 'Select class first'}
                                </MenuItem>
                            ) : (
                                sections.map((sec) => (
                                    <MenuItem key={sec.id} value={sec.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography>{sec.section_name}</Typography>
                                            <Chip
                                                label={`${sec.student_count || 0} students`}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Box>
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>

                    {/* Academic Year */}
                    <FormControl fullWidth size="small">
                        <InputLabel id="target-year-label">Academic Year</InputLabel>
                        <Select
                            labelId="target-year-label"
                            value={targetAcademicYearId || ''}
                            label="Academic Year"
                            onChange={(e) => setTargetAcademicYearId(e.target.value)}
                        >
                            {loggedUser?.academic_years?.map((year) => (
                                <MenuItem key={year.id} value={year.id}>
                                    {year.year_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Previous Year Status */}
                    <FormControl fullWidth size="small">
                        <InputLabel id="status-label">Previous Year Status</InputLabel>
                        <Select
                            labelId="status-label"
                            value={promotionStatus}
                            label="Previous Year Status"
                            onChange={(e) => setPromotionStatus(e.target.value)}
                        >
                            <MenuItem value="PROMOTED">Promoted</MenuItem>
                            <MenuItem value="FAILED">Failed</MenuItem>
                            <MenuItem value="DETAINED">Detained</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Preview Box */}
                    {targetClassId && targetSectionId && targetAcademicYearId && (
                        <Box
                            sx={{
                                p: 2,
                                bgcolor: 'success.lighter',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'success.light'
                            }}
                        >
                            <Typography variant="caption" color="success.dark">
                                Students will be promoted to{' '}
                                <strong>
                                    {targetClass?.class_name} - {targetSection?.section_name}
                                </strong>{' '}
                                for <strong>{targetYear?.year_name}</strong>. Previous enrollment status
                                will be marked as <strong>{promotionStatus}</strong>.
                            </Typography>
                        </Box>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} variant="outlined" disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handlePromote}
                    variant="contained"
                    color="primary"
                    disabled={
                        loading ||
                        !targetClassId ||
                        !targetSectionId ||
                        !targetAcademicYearId ||
                        selectedStudents.length === 0
                    }
                    startIcon={<IconTrendingUp size={18} />}
                >
                    {loading ? 'Promoting...' : 'Promote Students'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default PromoteStudents;
