import React, { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import { Spin } from 'antd';
import {
    IconSchool,
    IconUsersGroup,
    IconUsers,
    IconUser
} from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import customAxios from '../../../utils/axiosConfig';
import { SCHOOL_ADMIN_DASHBOARD } from '../../../ApiConstants';
import StatsCard from '../../../ui-component/cards/StatsCard';

const StatsCardsSection = () => {
    const { loggedUser, academicYear } = useSelector(state => ({
        loggedUser: state.globalState?.loggedUser,
        academicYear: state.globalState?.academicYear
    }));

    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (academicYear?.id) {
            fetchDashboardStats();
        }
    }, [academicYear]);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                `${SCHOOL_ADMIN_DASHBOARD}/stats/${loggedUser?.skid}`,
                {
                    params: {
                        academic_year_id: academicYear?.id
                    }
                }
            );

            if (response.data.code === 200) {
                setStats(response.data.data.stats);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            toast.error('Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Spin tip="Loading statistics..." spinning={loading}>
            <Grid container spacing={3}>
                <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 6, xs: 12 }}>
                    <StatsCard
                        title="Total Students"
                        value={stats?.students_count}
                        icon={IconSchool}
                        iconColor="#1976d2"
                        bgColor="#5E35B1"
                    />
                </Grid>

                <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 6, xs: 12 }}>
                    <StatsCard
                        title="Total Teachers"
                        value={stats?.teachers_count}
                        icon={IconUsersGroup}
                        iconColor="#2e7d32"
                        bgColor="#1E88E5"
                    />
                </Grid>

                <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 6, xs: 12 }}>
                    <StatsCard
                        title="Total Parents"
                        value={stats?.parents_count}
                        icon={IconUsers}
                        iconColor="#ed6c02"
                        bgColor="#43A047"
                    />
                </Grid>

                <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 6, xs: 12 }}>
                    <StatsCard
                        title="Overall Users"
                        value={stats?.overall_users_count}
                        icon={IconUser}
                        iconColor="#9c27b0"
                        bgColor="#FB8C00"
                    />
                </Grid>

                <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 6, xs: 12 }}>
                    <StatsCard
                        title="Today's Attendance"
                        value={`${stats?.today_attendance_present || 0} / ${stats?.today_attendance_total_students || 0}`}
                        icon={IconUsersGroup}
                        iconColor="#00acc1"
                        bgColor="#00897B"
                        subtitle={
                            stats?.today_attendance_total_students
                                ? `${Math.round(
                                    (stats.today_attendance_present / stats.today_attendance_total_students) * 100
                                )}% Present`
                                : 'No data'
                        }
                    />
                </Grid>
            </Grid>
        </Spin>
    );
};

export default StatsCardsSection;
