import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Grid,
    Divider,
    useTheme,
    useMediaQuery,
    Stack
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Print as PrintIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import customAxios from '../../../utils/axiosConfig';
import { TIME_TABLE_API_BASE_URL } from '../../../ApiConstants';
import dayjs from 'dayjs';
import { generateTimetablePdf } from '../../../prints/timetablePdfGenerator';
import { schoolData } from '../../../AppConstants';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TimetableView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const printRef = useRef();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { loggedUser } = useSelector((state) => state.globalState || {});

    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTimetable();
    }, [id]);

    const fetchTimetable = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                `${TIME_TABLE_API_BASE_URL}/view/${loggedUser?.skid}/${id}`
            );

            if (response.data.code === 200 && response.data.status === 'success') {
                setTimetable(response.data.data);
            } else {
                setError(response.data.message || 'Failed to load timetable');
            }
        } catch (err) {
            console.error('Error fetching timetable:', err);
            setError('Failed to load timetable');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = async () => {
        await generateTimetablePdf(timetable, schoolData, 'print');
    };

    const handleEdit = () => {
        navigate(`/timetable/edit/${id}`, {
            state: {
                timetable: timetable,
                mode: 'edit',
                isDraft: timetable.is_draft
            }
        });
    };

    const renderTimeSlotContent = (day, slot) => {
        if (slot.is_lunch) {
            return (
                <TableCell
                    key={day}
                    align="center"
                    sx={{
                        backgroundColor: 'info.lighter',
                        fontWeight: 'bold',
                        color: 'info.primary',
                        border: '1px solid',
                        borderColor: 'divider',
                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                        padding: { xs: 0.5, sm: 2 }
                    }}
                >
                    {isMobile ? 'LUNCH' : 'LUNCH BREAK'}
                </TableCell>
            );
        }

        const entry = timetable?.entries[`${day}-${slot.time_display}`];

        return (
            <TableCell
                key={day}
                align="center"
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    padding: { xs: 0.5, sm: 1, md: 2 },
                    backgroundColor: entry ? 'background.paper' : 'grey.50',
                    minWidth: { xs: 80, sm: 120 }
                }}
            >
                {entry ? (
                    <Box>
                        <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            color="primary"
                            sx={{
                                fontSize: { xs: '0.65rem', sm: '0.875rem' },
                                lineHeight: 1.2
                            }}
                        >
                            {entry.subject.subject_name}
                        </Typography>
                        {!isMobile && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                                sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
                            >
                                ({entry.subject.subject_code})
                            </Typography>
                        )}
                        <Typography
                            variant="body2"
                            sx={{ fontSize: { xs: '0.6rem', sm: '0.85rem' } }}
                        >
                            {isMobile
                                ? `${entry.teacher.first_name.charAt(0)}. ${entry.teacher.last_name}`
                                : `${entry.teacher.first_name} ${entry.teacher.last_name}`
                            }
                        </Typography>
                        {entry.room && (
                            <Chip
                                label={isMobile ? entry.room : `Room: ${entry.room}`}
                                size="small"
                                sx={{
                                    mt: { xs: 0.3, sm: 0.5 },
                                    fontSize: { xs: '0.55rem', sm: '0.7rem' },
                                    height: { xs: 16, sm: 20 },
                                    '& .MuiChip-label': {
                                        px: { xs: 0.5, sm: 1 }
                                    }
                                }}
                            />
                        )}
                    </Box>
                ) : (
                    <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
                    >
                        {isMobile ? 'Free' : 'Free Period'}
                    </Typography>
                )}
            </TableCell>
        );
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Alert severity="error">{error}</Alert>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/timetable/list')}
                    sx={{ mt: 2 }}
                    size={isMobile ? "small" : "medium"}
                >
                    Back to List
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 0, sm: 1, md: 2 } }}>
            {/* Header */}
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                mb: { xs: 2, sm: 3 },
                gap: { xs: 2, sm: 0 },
                px: { xs: 2, sm: 0 }
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
                    <Button
                        startIcon={<ArrowBackIcon size={isMobile ? 18 : 24} />}
                        onClick={() => navigate('/timetable/list')}
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                    >
                        Back
                    </Button>
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        sx={{ fontSize: { xs: '1.125rem', sm: '1.5rem', md: '2rem' } }}
                    >
                        View Timetable
                    </Typography>
                    {timetable?.is_draft && (
                        <Chip
                            label="DRAFT"
                            color="warning"
                            size={isMobile ? "small" : "medium"}
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                        />
                    )}
                </Box>

                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={{ xs: 1, sm: 2 }}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                    {timetable?.is_draft && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<EditIcon size={isMobile ? 16 : 20} />}
                            onClick={handleEdit}
                            size={isMobile ? "small" : "medium"}
                            fullWidth={isMobile}
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                            Edit Draft
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        startIcon={<PrintIcon size={isMobile ? 16 : 20} />}
                        onClick={handlePrint}
                        size={isMobile ? "small" : "medium"}
                        fullWidth={isMobile}
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                        Print
                    </Button>
                </Stack>
            </Box>

            {/* Timetable Info Card */}
            <Card elevation={2} sx={{ mb: { xs: 2, sm: 3 } }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
                    <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                        <Grid item xs={6} sm={3}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                            >
                                Class
                            </Typography>
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                sx={{ fontSize: { xs: '0.875rem', sm: '1.125rem' } }}
                            >
                                {timetable?.class_name}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                            >
                                Section
                            </Typography>
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                sx={{ fontSize: { xs: '0.875rem', sm: '1.125rem' } }}
                            >
                                {timetable?.section_name}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                            >
                                Academic Year
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{ fontSize: { xs: '0.875rem', sm: '1.125rem' } }}
                            >
                                {timetable?.academic_year}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                            >
                                Semester
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{ fontSize: { xs: '0.875rem', sm: '1.125rem' } }}
                            >
                                Semester {timetable?.semester}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />

                    <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                        <Grid item xs={6} sm={3}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                            >
                                Period Duration
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                            >
                                {timetable?.configuration.period_duration} min
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                            >
                                Start Time
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                            >
                                {timetable?.configuration.school_start_time}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                            >
                                Lunch Time
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                            >
                                {timetable?.configuration.lunch_start_time}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                            >
                                Total Periods
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                            >
                                {timetable?.configuration.total_periods}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Timetable Table */}
            <div ref={printRef}>
                <TableContainer
                    component={Paper}
                    elevation={3}
                    sx={{
                        overflowX: 'auto',
                        maxWidth: '100%'
                    }}
                >
                    <Table
                        sx={{ minWidth: { xs: 600, sm: 800 } }}
                        size={isMobile ? "small" : "medium"}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        fontWeight: 'bold',
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        width: { xs: 70, sm: 120 },
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                        padding: { xs: 1, sm: 2 }
                                    }}
                                >
                                    {isMobile ? 'Time' : 'Time / Day'}
                                </TableCell>
                                {daysOfWeek.map((day) => (
                                    <TableCell
                                        key={day}
                                        align="center"
                                        sx={{
                                            fontWeight: 'bold',
                                            backgroundColor: 'primary.main',
                                            color: 'white',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                            padding: { xs: 0.5, sm: 2 }
                                        }}
                                    >
                                        {isMobile ? day.substring(0, 3) : day}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {timetable?.time_slots.map((slot, index) => (
                                <TableRow key={index}>
                                    <TableCell
                                        sx={{
                                            fontWeight: 'bold',
                                            backgroundColor: 'grey.100',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            padding: { xs: 0.5, sm: 1 }
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            fontWeight="bold"
                                            sx={{ fontSize: { xs: '0.65rem', sm: '0.875rem' } }}
                                        >
                                            {isMobile ? slot.time_display.split(' - ')[0] : slot.label}
                                        </Typography>
                                        {!isMobile && (
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
                                            >
                                                {slot.time_display}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    {daysOfWeek.map((day) => renderTimeSlotContent(day, slot))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>

            {/* Footer Info */}
            <Box sx={{ mt: 2, textAlign: 'right', px: { xs: 2, sm: 0 } }}>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                >
                    Last Updated: {dayjs(timetable?.updated_at).format(isMobile ? 'DD MMM YY' : 'DD MMM YYYY, HH:mm')}
                </Typography>
            </Box>
        </Box>
    );
};

export default TimetableView;
