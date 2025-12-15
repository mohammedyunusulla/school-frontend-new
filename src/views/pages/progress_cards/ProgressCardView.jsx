import {
    Box,
    Button,
    Card, CardContent,
    Chip,
    Divider,
    Grid,
    LinearProgress,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import {
    IconArrowLeft,
    IconDownload,
    IconPrinter,
    IconTrophy
} from '@tabler/icons-react';
import { Table } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PROGRESS_CARD_API_BASE_URL } from '../../../ApiConstants';
import { generateProgressCardPdf } from '../../../prints/progressCardPdfGenerator';
import HeaderCard from '../../../ui-component/cards/HeaderCard';
import MainCard from '../../../ui-component/cards/MainCard';
import EduSphereLoader from '../../../ui-component/EduSphereLoader';
import customAxios from '../../../utils/axiosConfig';

const ProgressCardView = () => {
    const { studentId, examId } = useParams();
    const navigate = useNavigate();
    const { loggedUser } = useSelector((state) => state.globalState || {});

    // State management
    const [loading, setLoading] = useState(false);
    const [progressCard, setProgressCard] = useState(null);

    useEffect(() => {
        fetchProgressCard();
    }, [studentId, examId]);

    // Fetch progress card data
    const fetchProgressCard = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                `${PROGRESS_CARD_API_BASE_URL}/view/${loggedUser?.skid}/${studentId}/${examId}`
            );

            if (response.data.code === 200) {
                setProgressCard(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching progress card:', error);
            toast.error('Failed to fetch progress card');
        } finally {
            setLoading(false);
        }
    };

    // Handle PDF generation
    const handleGeneratePDF = async (action = 'download') => {
        if (!progressCard) {
            toast.error('Data not loaded yet');
            return;
        }

        try {
            setLoading(true);
            await generateProgressCardPdf(progressCard, action);
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF');
        } finally {
            setLoading(false);
        }
    };

    // Get grade color
    const getGradeColor = (grade) => {
        const gradeColors = {
            'A+': 'success',
            'A': 'success',
            'B+': 'info',
            'B': 'info',
            'C': 'warning',
            'D': 'warning',
            'F': 'error'
        };
        return gradeColors[grade] || 'default';
    };

    if (!progressCard) {
        return loading ? <EduSphereLoader loading={loading} /> : null;
    }

    const hasInternalExternal = progressCard.subject_details?.some(s => s.has_internal_external);

    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            key: 'index',
            width: 50,
            align: 'center',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Subject',
            dataIndex: 'subject_name',
            key: 'subject_name',
            render: (text, record) => (
                <Box>
                    <Typography variant="body2" fontWeight={500} >
                        {text}
                    </Typography>
                    < Typography variant="caption" color="text.secondary" >
                        {record.subject_code}
                    </Typography>
                </Box>
            ),
        },
        ...(hasInternalExternal ? [
            {
                title: 'Internal',
                dataIndex: 'internal_marks',
                key: 'internal_marks',
                align: 'center',
                render: (marks, record) => (
                    <Typography variant="body2" >
                        {record.has_internal_external ? (record.is_absent ? '-' : marks) : '-'}
                    </Typography>
                ),
            },
            {
                title: 'External',
                dataIndex: 'external_marks',
                key: 'external_marks',
                align: 'center',
                render: (marks, record) => (
                    <Typography variant="body2" >
                        {record.has_internal_external ? (record.is_absent ? '-' : marks) : '-'}
                    </Typography>
                ),
            }
        ] : []),
        {
            title: 'Total Marks',
            dataIndex: 'total_marks',
            key: 'total_marks',
            align: 'center',
            render: (marks, record) => (
                <Typography variant="body2" fontWeight={600} color={record.is_absent ? 'error' : 'inherit'} >
                    {record.is_absent ? 'AB' : marks}
                </Typography>
            ),
        },
        {
            title: 'Max Marks',
            dataIndex: 'max_marks',
            key: 'max_marks',
            align: 'center',
        },
        {
            title: 'Percentage',
            dataIndex: 'percentage',
            key: 'percentage',
            align: 'center',
            render: (percentage) => (
                <Box>
                    <Typography variant="body2" fontWeight={500} >
                        {percentage} %
                    </Typography>
                    < LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                        color={percentage >= 75 ? 'success' : percentage >= 50 ? 'warning' : 'error'}
                    />
                </Box>
            ),
        },
        {
            title: 'Grade',
            dataIndex: 'grade',
            key: 'grade',
            align: 'center',
            render: (grade, record) => (
                !record.is_absent && (
                    <Chip
                        label={grade}
                        size="small"
                        color={getGradeColor(grade)}
                    />
                )
            ),
        },
        {
            title: 'Remarks',
            dataIndex: 'remarks',
            key: 'remarks',
            render: (remarks) => (
                <Typography variant="caption" color="text.secondary" >
                    {remarks || '-'
                    }
                </Typography>
            ),
        },
    ];

    const footerData = [
        {
            index: '',
            subject_name: <Typography variant="body1" fontWeight="bold">GRAND TOTAL</Typography>,
            total_marks: <Typography variant="body1" fontWeight="bold">{progressCard.overall_total_marks}</Typography>,
            max_marks: <Typography variant="body1" fontWeight="bold">{progressCard.overall_max_marks}</Typography>,
            percentage: <Typography variant="body1" fontWeight="bold">{progressCard.overall_percentage.toFixed(2)}%</Typography>,
            grade: <Chip label={progressCard.overall_grade} color={getGradeColor(progressCard.overall_grade)} sx={{ fontWeight: 'bold' }} />,
            remarks: ''
        }
    ];

    const breadcrumbLinks = [
        { title: 'Dashboard', to: '/dashboard' },
        { title: 'Assigned Class Report', to: '/progress/view' },
        { title: 'Individual Report', to: '' },
    ];

    return (
        <>
            <EduSphereLoader loading={loading} />
            <HeaderCard
                heading='Progress Report Card'
                breadcrumbLinks={breadcrumbLinks}
                buttonColor={'primary'}
                buttonvariant={'variant'}
                onButtonClick={() => navigate(-1)}
                buttonIcon={<IconArrowLeft color='white' />}
            />

            <MainCard>
                {/* Student Information */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Stack spacing={2}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Typography variant="h4">{progressCard.student_name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Roll No: {progressCard.roll_number}
                                        </Typography>
                                    </Box>
                                    <Divider />
                                    <Stack spacing={1}>
                                        <Box display="flex">
                                            <Typography variant="body2" color="text.secondary">Class & Section : &nbsp;</Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {progressCard.class_name} - {progressCard.section_name}
                                            </Typography>
                                        </Box>
                                        <Box display="flex">
                                            <Typography variant="body2" color="text.secondary">Examination : &nbsp;</Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {progressCard.exam_name}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Grid container spacing={2}>
                            <Grid item xs={4}>
                                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.lighter' }}>
                                    <Typography variant="h4" color="info.dark">
                                        {progressCard.overall_percentage.toFixed(2)}%
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Percentage
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={4}>
                                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.lighter' }}>
                                    <Typography variant="h4" color="success.dark">
                                        {progressCard.overall_grade}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Grade
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={4}>
                                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.lighter' }}>
                                    <Stack alignItems="center" spacing={0.5}>
                                        <IconTrophy size={24} color="#ed6c02" />
                                        <Typography variant="h6" color="warning.dark">
                                            {progressCard.rank}/{progressCard.total_students}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Rank
                                        </Typography>
                                    </Stack>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={2} justifyContent="flex-start" flexWrap="wrap">
                        <Button
                            variant="outlined"
                            startIcon={<IconDownload />}
                            onClick={() => handleGeneratePDF('download')}
                        >
                            Download PDF
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<IconPrinter />}
                            onClick={() => handleGeneratePDF('print')}
                        >
                            Print
                        </Button>
                    </Stack>
                </Box>

                <Typography variant="h5" gutterBottom>
                    Subject-wise Performance
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Table
                    columns={columns}
                    dataSource={progressCard.subject_details}
                    rowKey="subject_id"
                    pagination={false}
                    size="small"
                    // bordered
                    footer={() => (
                        <Table
                            columns={columns}
                            dataSource={footerData}
                            pagination={false}
                            showHeader={false}
                            size="small"
                            rowClassName={() => 'total-row'}
                        />
                    )}
                />

                <br />
                {/* Attendance & Remarks */}
                <Grid container spacing={2}>
                    {progressCard.attendance && (
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Attendance</Typography>
                                    <Typography variant="body2">
                                        Days Present: <strong>{progressCard.attendance.present_days}</strong> / {progressCard.attendance.total_days}
                                        ({progressCard.attendance.percentage?.toFixed(1)}%)
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                    <Grid item xs={12} md={progressCard.attendance ? 6 : 12}>
                        <Card variant="outlined" sx={{ bgcolor: 'info.lighter' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Class Teacher's Remarks</Typography>
                                <Typography variant="body2">
                                    {progressCard.class_teacher_remarks || 'No remarks provided.'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    - {progressCard.class_teacher_name}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                </Grid>
                {/* CSS for table footer styling */}
                <style>{`
                      .total-row {
                        background-color: #f9f6f6ff !important;
                        font-weight: bold;
                      }
                      .ant-table-footer {
                        padding: 0 !important;
                      }
                      .ant-table-footer .ant-table-wrapper {
                        margin: 0 !important;
                      }
                    `}
                </style>
            </MainCard>
        </>
    );
};

export default ProgressCardView;
