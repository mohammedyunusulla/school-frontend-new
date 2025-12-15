import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Chip,
    Stack,
    Divider
} from '@mui/material';
import { Spin } from 'antd';
import { IconBell, IconAlertCircle } from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import customAxios from '../../../utils/axiosConfig';
import { ANNOUNCEMENT_API_BASE_URL } from '../../../ApiConstants';
import MainCard from '../../../ui-component/cards/MainCard';

const AnnouncementsCard = () => {
    const { loggedUser, academicYear } = useSelector(state => ({
        loggedUser: state.globalState?.loggedUser,
        academicYear: state.globalState?.academicYear
    }));

    const [loading, setLoading] = useState(false);
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        if (academicYear?.id) {
            fetchAnnouncements();
        }
    }, [academicYear]);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                `${ANNOUNCEMENT_API_BASE_URL}/list/${loggedUser?.skid}`,
                {
                    params: {
                        academic_year_id: academicYear?.id,
                        user_role: loggedUser?.role,
                        school_user_id: loggedUser?.school_user_id
                    }
                }
            );

            if (response.data.code === 200) {
                setAnnouncements(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
            toast.error('Failed to load announcements');
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'HIGH':
                return 'error';
            case 'MEDIUM':
                return 'warning';
            default:
                return 'info';
        }
    };

    return (
        <MainCard
            title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconBell size={20} />
                    <Typography variant="h4">Recent Announcements</Typography>
                </Box>
            }
        >
            <Spin tip="Loading announcements..." spinning={loading}>
                {announcements.length === 0 && !loading ? (
                    <Box
                        sx={{
                            textAlign: 'center',
                            py: 4,
                            color: 'text.secondary'
                        }}
                    >
                        <IconAlertCircle size={48} style={{ opacity: 0.5 }} />
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            No announcements available
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ maxHeight: 380, overflow: 'auto' }}>
                        {announcements.map((announcement, index) => (
                            <React.Fragment key={announcement.id}>
                                <ListItem alignItems="flex-start">
                                    <ListItemAvatar>
                                        <Avatar
                                            sx={{
                                                color: 'white',
                                                bgcolor: announcement.priority === 'HIGH'
                                                    ? 'error.main'
                                                    : 'primary.main'
                                            }}
                                        >
                                            <IconBell size={20} />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                mb: 0.5
                                            }}>
                                                <Typography variant="subtitle1" fontWeight={600}>
                                                    {announcement.title}
                                                </Typography>
                                                <Chip
                                                    label={announcement.priority}
                                                    size="small"
                                                    color={getPriorityColor(announcement.priority)}
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <React.Fragment>
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    color="text.primary"
                                                    sx={{ display: 'block', mb: 1 }}
                                                >
                                                    {announcement.description}
                                                </Typography>
                                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                                    <Chip
                                                        label={announcement.announcement_type}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    <Typography variant="caption" color="text.secondary">
                                                        By: {announcement.creator_name}
                                                    </Typography>
                                                </Stack>
                                            </React.Fragment>
                                        }
                                    />
                                </ListItem>
                                {index < announcements.length - 1 && <Divider variant="inset" component="li" />}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Spin>
        </MainCard>
    );
};

export default AnnouncementsCard;
