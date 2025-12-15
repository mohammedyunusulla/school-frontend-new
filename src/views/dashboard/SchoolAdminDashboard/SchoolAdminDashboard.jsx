import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import StatsCardsSection from './StatsCardsSection';
import AnnouncementsCard from '../components/AnnouncementsCard';
import ExpenseTrend from '../components/ExpenseTrend';
import TimetableCard from '../components/TimetableCard';
import MainCard from '../../../ui-component/cards/MainCard';
import HeaderCard from '../../../ui-component/cards/HeaderCard';

const SchoolAdminDashboard = () => {
    const { academicYear } = useSelector(state => ({
        academicYear: state.globalState?.academicYear
    }));

    return (
        <Box sx={{
            pl: { xs: 0, sm: 2, md: 3 },
            pr: { xs: 0, sm: 2, md: 3 }
        }}>
            {/* Header */}
            <HeaderCard
                heading={
                    <Box>
                        <Typography variant="h2" gutterBottom color='white'>
                            Hello School Admin, Welcome back !
                        </Typography>
                        <Typography variant="body2" color="white">
                            Academic Year: {academicYear?.year_name}
                        </Typography>
                    </Box>
                }
                breadcrumbLinks={false}
            />

            {/* Stats Cards Section */}
            <StatsCardsSection />

            <br />

            {/* Expense Trend and Announcements */}
            <Grid container spacing={3}>
                <Grid item size={{ xl: 8, lg: 8, md: 12, sm: 12, xs: 12 }}>
                    <MainCard>
                        <ExpenseTrend />
                    </MainCard>
                </Grid>

                <Grid item size={{ xl: 4, lg: 4, md: 12, sm: 12, xs: 12 }}>
                    <AnnouncementsCard />
                </Grid>
            </Grid>

            <br />

            {/* Timetable */}
            <Grid container spacing={3}>
                <Grid item size={{ xl: 12, lg: 12, md: 12, sm: 12, xs: 12 }}>
                    <TimetableCard />
                </Grid>
            </Grid>
        </Box>
    );
};

export default SchoolAdminDashboard;
