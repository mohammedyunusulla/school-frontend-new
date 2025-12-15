import { useEffect, useRef, useState } from 'react';

// material-ui
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// project imports
import useConfig from 'hooks/useConfig';
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';

// assets
import { IconCalendar, IconLogout, IconSettings, IconUser } from '@tabler/icons-react';
import User1 from 'assets/images/users/user-round.svg';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { logoutUser } from '../../../../store/slices/authSlice';
import AcademicYearManagement from '../../../../views/pages/components/AcademicYearManagement';

// ==============================|| PROFILE MENU ||============================== //

export default function ProfileSection() {
    const theme = useTheme();
    const { borderRadius } = useConfig();
    const [selectedIndex] = useState(-1);
    const [open, setOpen] = useState(false);
    const [openAcademicYearDialog, setOpenAcademicYearDialog] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loggedUser } = useSelector((state) => state.globalState || {});

    /**
     * anchorRef is used on different components and specifying one type leads to other components throwing an error
     * */
    const anchorRef = useRef(null);

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    const prevOpen = useRef(open);
    useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current.focus();
        }

        prevOpen.current = open;
    }, [open]);

    const handleLogout = async () => {
        try {
            // No data usually needed for logout thunk
            await dispatch(logoutUser()).unwrap();
            navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
            // toast.error(error.message || "Logout failed");
        }
    };

    const handleNavigate = () => {
        if (loggedUser.role === 'TEACHER') {
            navigate('/teacher/profile/edit');
        }
        setOpen((prevOpen) => !prevOpen);
    }

    const handleOpenAcademicYear = () => {
        setOpenAcademicYearDialog(true);
        setOpen(false);
    };

    return (
        <>
            <Chip
                sx={{
                    ml: 2,
                    height: '48px',
                    alignItems: 'center',
                    borderRadius: '27px',
                    '& .MuiChip-label': {
                        lineHeight: 0
                    }
                }}
                icon={
                    <Avatar
                        // src={User1}
                        alt="user-images"
                        sx={{
                            ...theme.typography.mediumAvatar,
                            margin: '8px 0 8px 8px !important',
                            cursor: 'pointer'
                        }}
                        ref={anchorRef}
                        aria-controls={open ? 'menu-list-grow' : undefined}
                        aria-haspopup="true"
                        color="inherit"
                    />
                }
                label={<IconSettings stroke={1.5} size="24px" />}
                ref={anchorRef}
                aria-controls={open ? 'menu-list-grow' : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
                color="primary"
                aria-label="user-account"
            />
            <Popper
                placement="bottom"
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                modifiers={[
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 14]
                        }
                    }
                ]}
            >
                {({ TransitionProps }) => (
                    <ClickAwayListener onClickAway={handleClose}>
                        <Transitions in={open} {...TransitionProps}>
                            <Paper>
                                {open && (
                                    <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                                        <Box sx={{ p: 2, pb: 0 }}>
                                            <Stack>
                                                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                                                    <Typography variant="h4">Hello,</Typography>
                                                    <Typography component="span" variant="h4" sx={{ fontWeight: 400 }}>
                                                        {loggedUser?.full_name}
                                                    </Typography>
                                                </Stack>
                                                <Typography variant="subtitle2">{loggedUser?.role_obj?.role_name}</Typography>
                                            </Stack>
                                            {/* <OutlinedInput
                                                sx={{ width: '100%', pr: 1, pl: 2, my: 2 }}
                                                id="input-search-profile"
                                                value={value}
                                                onChange={(e) => setValue(e.target.value)}
                                                placeholder="Search profile options"
                                                startAdornment={
                                                    <InputAdornment position="start">
                                                        <IconSearch stroke={1.5} size="16px" />
                                                    </InputAdornment>
                                                }
                                                aria-describedby="search-helper-text"
                                                slotProps={{ input: { 'aria-label': 'weight' } }}
                                            /> */}
                                            {/* <Divider /> */}
                                        </Box>
                                        <Box
                                            sx={{
                                                p: 2,
                                                py: 0,
                                                height: '100%',
                                                maxHeight: 'calc(100vh - 250px)',
                                                overflowX: 'hidden',
                                                '&::-webkit-scrollbar': { width: 5 }
                                            }}
                                        >
                                            <List
                                                component="nav"
                                                sx={{
                                                    width: '100%',
                                                    maxWidth: 350,
                                                    minWidth: 300,
                                                    borderRadius: `${borderRadius}px`,
                                                    '& .MuiListItemButton-root': { mt: 0.5 }
                                                }}
                                            >
                                                <ListItemButton onClick={handleNavigate} sx={{ borderRadius: `${borderRadius}px` }} selected={selectedIndex === 1}>
                                                    <ListItemIcon><IconUser stroke={1.5} size="20px" /></ListItemIcon>
                                                    <ListItemText
                                                        primary={
                                                            <Grid container spacing={1} sx={{ justifyContent: 'space-between' }}>
                                                                <Grid>
                                                                    <Typography variant="body2">Edit Profile</Typography>
                                                                </Grid>
                                                            </Grid>
                                                        }
                                                    />
                                                </ListItemButton>
                                                <Divider />
                                                {loggedUser.role === "SCHOOL_ADMIN" && <>
                                                    <ListItemButton onClick={handleOpenAcademicYear} sx={{ borderRadius: `${borderRadius}px` }} selected={selectedIndex === 2}>
                                                        <ListItemIcon><IconCalendar stroke={1.5} size="20px" /></ListItemIcon>
                                                        <ListItemText primary={<Typography variant="body2">Academic Year Mng</Typography>} />
                                                    </ListItemButton>
                                                    <Divider />
                                                </>}
                                                <ListItemButton onClick={handleLogout} sx={{ borderRadius: `${borderRadius}px` }} selected={selectedIndex === 3}>
                                                    <ListItemIcon><IconLogout stroke={1.5} size="20px" /></ListItemIcon>
                                                    <ListItemText primary={<Typography variant="body2">Logout</Typography>} />
                                                </ListItemButton>
                                            </List>
                                        </Box>
                                    </MainCard>
                                )}
                            </Paper>
                        </Transitions>
                    </ClickAwayListener>
                )}
            </Popper>

            {/* Academic Year Management Dialog */}
            <AcademicYearManagement
                open={openAcademicYearDialog}
                onClose={() => setOpenAcademicYearDialog(false)}
            />
        </>
    );
}
