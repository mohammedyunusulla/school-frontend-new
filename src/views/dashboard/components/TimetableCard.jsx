import {
    Box,
    Chip,
    CircularProgress,
    Grid,
    MenuItem,
    TextField,
    Typography
} from '@mui/material';
import { IconBook } from '@tabler/icons-react';
import { Spin, Table } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { CLASSES_API_BASE_URL, SCHOOL_ADMIN_DASHBOARD } from '../../../ApiConstants';
import MainCard from '../../../ui-component/cards/MainCard';
import customAxios from '../../../utils/axiosConfig';


const TimetableCard = () => {
    const { loggedUser, academicYear } = useSelector(state => ({
        loggedUser: state.globalState?.loggedUser,
        academicYear: state.globalState?.academicYear
    }));

    const [loading, setLoading] = useState(false);
    const [classesLoading, setClassesLoading] = useState(false);
    const [sectionsLoading, setSectionsLoading] = useState(false);

    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [timetableData, setTimetableData] = useState(null);

    useEffect(() => {
        if (academicYear?.id) {
            fetchClasses();
        }
    }, [academicYear]);

    useEffect(() => {
        if (selectedClass) {
            fetchSections();
        }
    }, [selectedClass]);

    useEffect(() => {
        if (selectedClass && selectedSection) {
            fetchTimetable();
        } else if (academicYear?.id) {
            // Fetch default timetable (last created)
            fetchTimetable();
        }
    }, [selectedClass, selectedSection, academicYear]);

    const fetchClasses = async () => {
        try {
            setClassesLoading(true);
            const response = await customAxios.get(CLASSES_API_BASE_URL + '/list/' + loggedUser?.skid);
            if (response.data.code === 200 && response.data.status === 'success') {
                setClasses(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            toast.error('Error fetching classes');
        } finally {
            setClassesLoading(false);
        }
    };

    const fetchSections = async () => {
        try {
            setSectionsLoading(true);
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
            setSectionsLoading(false);
        }
    };

    const fetchTimetable = async () => {
        try {
            setLoading(true);
            const params = {
                academic_year_id: academicYear?.id
            };

            if (selectedClass) params.class_id = selectedClass;
            if (selectedSection) params.section_id = selectedSection;

            const response = await customAxios.get(
                `${SCHOOL_ADMIN_DASHBOARD}/timetable/${loggedUser?.skid}`,
                { params }
            );

            if (response.data.code === 200 && response.data.status === 'success') {
                setTimetableData(response.data.data);

                // Auto-populate class and section if not selected
                if (!selectedClass && response.data.data.timetable) {
                    setSelectedClass(response.data.data.timetable.class_id);
                }
                if (!selectedSection && response.data.data.timetable) {
                    setSelectedSection(response.data.data.timetable.section_id);
                }
            }
        } catch (error) {
            console.error('Error fetching timetable:', error);
            toast.error('Error fetching timetable');
        } finally {
            setLoading(false);
        }
    };

    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Get period timing from any day's entry for that period
    const getPeriodTiming = (periodNumber) => {
        if (!timetableData?.entries) return null;

        const entry = timetableData.entries.find(e => e.period_number === periodNumber);
        if (entry) {
            return `${entry.start_time} - ${entry.end_time}`;
        }
        return null;
    };

    // Prepare table columns
    const getColumns = () => {
        if (!timetableData?.timetable_by_day) return [];

        const columns = [
            {
                title: 'Period',
                dataIndex: 'period',
                key: 'period',
                // fixed: 'left',
                width: 50,
                align: 'center',
                render: (text, record) => (
                    <Box>
                        <Typography variant="body1" fontWeight={600}>
                            {text}
                        </Typography>
                        {record.timing && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                                sx={{ fontSize: '0.7rem', mt: 0.5 }}
                                fontWeight={500}
                            >
                                {record.timing}
                            </Typography>
                        )}
                    </Box>
                )
            }
        ];

        // Add columns for each day that has data
        daysOrder.forEach(day => {
            if (timetableData.timetable_by_day[day]) {
                columns.push({
                    title: day,
                    dataIndex: day.toLowerCase(),
                    key: day.toLowerCase(),
                    width: 180,
                    align: 'center',
                    render: (entry) => {
                        if (!entry) {
                            return (
                                <Typography variant="body2" color="text.secondary">
                                    -
                                </Typography>
                            );
                        }
                        return (
                            <Box sx={{ padding: '8px 4px' }}>
                                <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    sx={{ mb: 0.5 }}
                                >
                                    {entry.subject_name}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                >
                                    {entry.teacher_name}
                                </Typography>
                                {entry.room_number && (
                                    <Chip
                                        label={`Room ${entry.room_number}`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        sx={{
                                            mt: 0.5,
                                            height: 20,
                                            fontSize: '0.65rem'
                                        }}
                                    />
                                )}
                            </Box>
                        );
                    }
                });
            }
        });

        return columns;
    };

    // Prepare table data
    const getTableData = () => {
        if (!timetableData?.timetable) return [];

        const data = [];
        for (let i = 1; i <= timetableData.timetable.total_periods; i++) {
            const row = {
                key: i,
                period: i,
                timing: getPeriodTiming(i)
            };

            daysOrder.forEach(day => {
                const dayEntries = timetableData.timetable_by_day[day] || [];
                const entry = dayEntries.find(e => e.period_number === i);
                row[day.toLowerCase()] = entry || null;
            });

            data.push(row);
        }

        return data;
    };

    return (
        <MainCard
            title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconBook size={20} color="#1976d2" />
                    <Typography variant="h4">Class Timetable</Typography>
                </Box>
            }
        >
            {/* Filters */}
            <Grid container spacing={2} mb={3}>
                <Grid item size={{ xl: 2, lg: 2, md: 4, sm: 6, xs: 12 }}>
                    <TextField
                        select
                        size="small"
                        label="Select Class"
                        value={selectedClass}
                        onChange={(e) => {
                            setSelectedClass(e.target.value);
                            setSelectedSection('');
                            setSections([]);
                        }}
                        disabled={classesLoading}
                        fullWidth
                    >
                        <MenuItem value="" disabled>
                            {classesLoading ? 'Loading...' : 'Select Class'}
                        </MenuItem>
                        {classes.map((cls) => (
                            <MenuItem key={cls.id} value={cls.id}>
                                {cls.class_name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item size={{ xl: 2, lg: 2, md: 4, sm: 6, xs: 12 }}>
                    <TextField
                        select
                        size="small"
                        label="Select Section"
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        disabled={!selectedClass || sectionsLoading}
                        fullWidth
                    >
                        <MenuItem value="" disabled>
                            {sectionsLoading ? 'Loading...' : 'Select Section'}
                        </MenuItem>
                        {sections.map((section) => (
                            <MenuItem key={section.id} value={section.id}>
                                {section.section_name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
            </Grid>

            {/* Timetable Content */}
            <Spin tip="Loading timetable..." spinning={loading}>
                {timetableData?.timetable ? (
                    <Table
                        columns={getColumns()}
                        dataSource={getTableData()}
                        pagination={false}
                        scroll={{ x: 'max-content' }}
                        bordered
                        size="middle"
                    />
                ) : (
                    !loading && (
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            minHeight={200}
                        >
                            <Typography color="text.secondary">
                                No timetable available for the selected class and section
                            </Typography>
                        </Box>
                    )
                )}
            </Spin>
        </MainCard>
    );
};

export default TimetableCard;
