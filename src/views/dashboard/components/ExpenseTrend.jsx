import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import customAxios from '../../../utils/axiosConfig';
import { SCHOOL_ADMIN_DASHBOARD } from '../../../ApiConstants';
import {
    Box, Typography, Card, CardContent, MenuItem, TextField, Stack, Grid, Chip,
    Button
} from '@mui/material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { MONTHS } from '../../../AppConstants';
import { Spin } from 'antd';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ExpenseTrend = () => {
    const { loggedUser, academicYear } = useSelector(state => ({
        loggedUser: state.globalState?.loggedUser || null,
        academicYear: state.globalState?.academicYear || null
    }));
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [breakdown, setBreakdown] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    // Color palette for different categories
    const categoryColors = [
        { border: 'rgb(255, 99, 132)', bg: 'rgba(255, 99, 132, 0.2)' },
        { border: 'rgb(54, 162, 235)', bg: 'rgba(54, 162, 235, 0.2)' },
        { border: 'rgb(255, 206, 86)', bg: 'rgba(255, 206, 86, 0.2)' },
        { border: 'rgb(75, 192, 192)', bg: 'rgba(75, 192, 192, 0.2)' },
        { border: 'rgb(153, 102, 255)', bg: 'rgba(153, 102, 255, 0.2)' },
        { border: 'rgb(255, 159, 64)', bg: 'rgba(255, 159, 64, 0.2)' },
        { border: 'rgb(199, 199, 199)', bg: 'rgba(199, 199, 199, 0.2)' },
        { border: 'rgb(83, 102, 255)', bg: 'rgba(83, 102, 255, 0.2)' },
        { border: 'rgb(255, 99, 255)', bg: 'rgba(255, 99, 255, 0.2)' }
    ];

    useEffect(() => {
        if (academicYear?.id) {
            fetchExpenseBreakdown();
        }
    }, [selectedMonth, academicYear]);

    const fetchExpenseBreakdown = async () => {
        setLoading(true);
        try {
            const response = await customAxios.get(
                `${SCHOOL_ADMIN_DASHBOARD}/breakdown/monthly/${loggedUser.skid}?academic_year_id=${academicYear?.id}&month=${selectedMonth}`
            );
            setBreakdown(response.data.breakdown);
        } catch (error) {
            console.error('Error fetching expense breakdown:', error);
        } finally {
            setLoading(false);
        }
    };

    const chartData = {
        labels: breakdown?.dates?.map(item => `${item.day}`) || [],
        datasets: breakdown?.categories?.map((category, index) => {
            const color = categoryColors[index % categoryColors.length];
            return {
                label: category,
                data: breakdown.category_data[category]?.map(item => item.amount) || [],
                borderColor: color.border,
                backgroundColor: color.bg,
                tension: 0.4,
                fill: false,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: color.border,
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            };
        }) || []
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: window.innerWidth < 600 ? 10 : 13,
                        weight: '500'
                    },
                    padding: window.innerWidth < 600 ? 8 : 15,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    boxWidth: window.innerWidth < 600 ? 8 : 12
                }
            },
            // title: {
            //     display: false,
            //     text: `${breakdown?.month_name} ${breakdown?.year}`,
            //     font: {
            //         size: window.innerWidth < 600 ? 14 : 18,
            //         weight: 'bold'
            //     },
            //     padding: {
            //         bottom: window.innerWidth < 600 ? 10 : 20
            //     }
            // },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString('en-IN')}`;
                    },
                    title: function (context) {
                        return `${breakdown?.month_name} ${context[0].label}, ${breakdown?.year}`;
                    }
                },
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { size: 11 },
                bodyFont: { size: 12, weight: 'bold' },
                padding: 10
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                stacked: false,
                ticks: {
                    callback: function (value) {
                        return '₹' + (window.innerWidth < 600 ? (value / 1000).toFixed(0) + 'K' : value.toLocaleString('en-IN'));
                    },
                    font: {
                        size: window.innerWidth < 600 ? 9 : 12
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                title: {
                    display: window.innerWidth >= 600,
                    text: 'Day of Month',
                    font: {
                        size: 13,
                        weight: '500'
                    }
                },
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: window.innerWidth < 600 ? 9 : 12
                    },
                    maxRotation: window.innerWidth < 600 ? 45 : 0,
                    minRotation: window.innerWidth < 600 ? 45 : 0
                }
            }
        }
    };

    return (
        <Spin tip="Loading expense data..." spinning={loading}>
            <Box sx={{ p: { xs: 0, sm: 1 } }}>
                {/* Header */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    mb: { xs: 2, sm: 3 },
                    gap: { xs: 2, sm: 0 }
                }}>
                    <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
                        <Typography
                            variant="h4"
                            sx={{ fontSize: { xs: '1.125rem', sm: '1.5rem' } }}
                        >
                            Expense Trend by Category
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                            Academic Year: {academicYear?.year_name}
                        </Typography>
                    </Box>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 1,
                        width: { xs: '100%', sm: 'auto' },
                        flexDirection: { xs: 'column', sm: 'row' }
                    }}>
                        <Button
                            variant='contained'
                            color='primary'
                            startIcon={<IconPlus size={18} />}
                            onClick={() => navigate("/expense/list")}
                            fullWidth={window.innerWidth < 600}
                            size={window.innerWidth < 600 ? 'small' : 'medium'}
                        >
                            Expense
                        </Button>
                        <TextField
                            select
                            size="small"
                            label="Month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            sx={{
                                minWidth: { xs: '100%', sm: 150 },
                                width: { xs: '100%', sm: 'auto' },
                                mt: { xs: 2, sm: 0 }
                            }}
                        >
                            {MONTHS.map((month) => (
                                <MenuItem key={month.value} value={month.value}>
                                    {month.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </Box>

                {/* Summary Card */}
                <Card sx={{ mb: { xs: 2, sm: 1 }, bgcolor: '#e3f2fd' }}>
                    <CardContent sx={{
                        p: { xs: 2, sm: 3 },
                        '&:last-child': { pb: { xs: 2, sm: 3 } }
                    }}>
                        <Grid container spacing={{ xs: 2, sm: 3 }}>
                            <Grid item xs={12} md={6}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                >
                                    Total Expenses for {breakdown?.month_name} {breakdown?.year}
                                </Typography>
                                <Typography
                                    variant="h3"
                                    color="primary"
                                    fontWeight="700"
                                    sx={{
                                        mt: 1,
                                        fontSize: { xs: '1.5rem', sm: '2rem' }
                                    }}
                                >
                                    ₹{breakdown?.total_expenses?.toLocaleString('en-IN') || 0}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mb: 1,
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                    }}
                                >
                                    Category Breakdown
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {breakdown?.categories?.map((category, index) => {
                                        const color = categoryColors[index % categoryColors.length];
                                        return (
                                            <Chip
                                                key={category}
                                                label={`${category}: ₹${breakdown?.category_totals[category]?.toLocaleString('en-IN') || 0}`}
                                                size="small"
                                                sx={{
                                                    bgcolor: color.bg,
                                                    borderColor: color.border,
                                                    borderWidth: 2,
                                                    borderStyle: 'solid',
                                                    fontWeight: 600,
                                                    mb: 1,
                                                    fontSize: { xs: '0.65rem', sm: '0.8125rem' },
                                                    height: { xs: 24, sm: 32 }
                                                }}
                                            />
                                        );
                                    })}
                                </Stack>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Line Chart */}
                <Card>
                    <CardContent sx={{
                        p: { xs: 1, sm: 2, md: 3 },
                        '&:last-child': { pb: { xs: 1, sm: 2, md: 3 } }
                    }}>
                        <Box sx={{ height: { xs: 300, sm: 400, md: 500 } }}>
                            {breakdown?.dates?.length > 0 ? (
                                <Line data={chartData} options={chartOptions} />
                            ) : (
                                <Box sx={{
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    p: 2
                                }}>
                                    <Typography
                                        variant="h6"
                                        color="text.secondary"
                                        sx={{
                                            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
                                            textAlign: 'center'
                                        }}
                                    >
                                        No expense data available for {breakdown?.month_name} {breakdown?.year}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Spin>
    );
};

export default ExpenseTrend;
