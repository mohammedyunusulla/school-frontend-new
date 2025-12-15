import {
    Avatar, Box, Card, Divider, InputAdornment,
    List, ListItemButton, ListItemIcon, ListItemText, OutlinedInput, Popper, Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconSearch, IconX } from '@tabler/icons-react';
import PopupState, { bindPopper, bindToggle } from 'material-ui-popup-state';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Transitions from 'ui-component/extended/Transitions';
import { navigationItems } from './navigationItems';
import { inputStyles } from '../../../../AppConstants';


function HeaderAvatarComponent({ children, ...others }) {
    const theme = useTheme();

    return (
        <Avatar
            variant="rounded"
            sx={{
                ...theme.typography.commonAvatar,
                ...theme.typography.mediumAvatar,
                background: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.secondary.light,
                color: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.secondary.dark,
                '&:hover': {
                    background: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.secondary.dark,
                    color: theme.palette.mode === 'dark' ? theme.palette.secondary.light : theme.palette.secondary.light
                }
            }}
            {...others}
        >
            {children}
        </Avatar>
    );
}

const HeaderAvatar = HeaderAvatarComponent;

// ==============================|| SEARCH INPUT - MOBILE||============================== //

function MobileSearch({ value, setValue, popupState, filteredItems, handleNavigate }) {
    const theme = useTheme();

    return (
        <>
            <OutlinedInput
                id="input-search-header-mobile"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Search pages..."
                startAdornment={
                    <InputAdornment position="start">
                        <IconSearch stroke={1.5} size="16px" />
                    </InputAdornment>
                }
                endAdornment={
                    <InputAdornment position="end">
                        <Box
                            sx={{ ml: 1, cursor: 'pointer' }}
                            onClick={() => {
                                setValue('');
                                popupState.close();
                            }}
                        >
                            <IconX stroke={1.5} size="20px" />
                        </Box>
                    </InputAdornment>
                }
                aria-describedby="search-helper-text"
                slotProps={{ input: { 'aria-label': 'weight', sx: { bgcolor: 'transparent', pl: 0.5 } } }}
                sx={{ width: '100%', ml: 0.5, px: 2, bgcolor: 'background.paper' }}
            />

            {value && filteredItems.length > 0 && (
                <Card sx={{ mt: 1, maxHeight: 400, overflow: 'auto' }}>
                    <List>
                        {filteredItems.map((item, index) => (
                            <Box key={index}>
                                <ListItemButton
                                    onClick={() => {
                                        handleNavigate(item.path);
                                        setValue('');
                                        popupState.close();
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <item.icon size={20} stroke={1.5} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography variant="body2" fontWeight={500}>
                                                {item.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="caption" color="text.secondary">
                                                {item.description}
                                            </Typography>
                                        }
                                    />
                                </ListItemButton>
                                {index < filteredItems.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </List>
                </Card>
            )}
        </>
    );
}

// ==============================|| SEARCH INPUT ||============================== //

export default function SearchSection() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [value, setValue] = useState('');

    // Filter navigation items based on search value
    const filteredItems = useMemo(() => {
        if (!value.trim()) return [];

        const searchLower = value.toLowerCase();
        return navigationItems
            .filter((item) => {
                return (
                    item.title.toLowerCase().includes(searchLower) ||
                    item.description.toLowerCase().includes(searchLower) ||
                    item.keywords.some(keyword => keyword.includes(searchLower))
                );
            })
            .slice(0, 6); // Limit to 6 results
    }, [value]);

    const handleNavigate = (path) => {
        navigate(path);
        setValue('');
    };

    return (
        <>
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <PopupState variant="popper" popupId="demo-popup-popper">
                    {(popupState) => (
                        <>
                            <Box sx={{ ml: 2 }}>
                                <HeaderAvatar {...bindToggle(popupState)}>
                                    <IconSearch stroke={1.5} size="19.2px" />
                                </HeaderAvatar>
                            </Box>
                            <Popper
                                {...bindPopper(popupState)}
                                transition
                                sx={{ zIndex: 1100, width: '99%', top: '-55px !important', px: { xs: 1.25, sm: 1.5 } }}
                            >
                                {({ TransitionProps }) => (
                                    <>
                                        <Transitions type="zoom" {...TransitionProps} sx={{ transformOrigin: 'center left' }}>
                                            <Card
                                                sx={{
                                                    background: theme.palette.mode === 'dark' ? theme.palette.dark[900] : '#fff',
                                                    [theme.breakpoints.down('sm')]: {
                                                        border: 0,
                                                        boxShadow: 'none'
                                                    }
                                                }}
                                            >
                                                <Box sx={{ p: 2 }}>
                                                    <MobileSearch
                                                        value={value}
                                                        setValue={setValue}
                                                        popupState={popupState}
                                                        filteredItems={filteredItems}
                                                        handleNavigate={handleNavigate}
                                                    />
                                                </Box>
                                            </Card>
                                        </Transitions>
                                    </>
                                )}
                            </Popper>
                        </>
                    )}
                </PopupState>
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'relative' }}>
                <OutlinedInput
                    id="input-search-header"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Search pages..."
                    startAdornment={
                        <InputAdornment position="start">
                            <IconSearch stroke={1.5} size="16px" />
                        </InputAdornment>
                    }
                    endAdornment={
                        value && (
                            <InputAdornment position="end">
                                <Box sx={{ cursor: 'pointer' }} onClick={() => setValue('')}>
                                    <IconX stroke={1.5} size="20px" />
                                </Box>
                            </InputAdornment>
                        )
                    }
                    aria-describedby="search-helper-text"
                    slotProps={{ input: { 'aria-label': 'weight', sx: { bgcolor: 'transparent', pl: 0.5 } } }}
                    sx={{ ...inputStyles, width: { md: 250, lg: 434 }, ml: 2, px: 2 }}
                />

                {/* Dropdown suggestions */}
                {value && filteredItems.length > 0 && (
                    <Card
                        sx={{
                            position: 'absolute',
                            top: '110%',
                            left: 0,
                            right: 0,
                            zIndex: 1200,
                            maxHeight: 400,
                            overflow: 'auto',
                            ml: 2,
                            boxShadow: theme.shadows[8]
                        }}
                    >
                        <List>
                            {filteredItems.map((item, index) => (
                                <Box key={index}>
                                    <ListItemButton
                                        onClick={() => handleNavigate(item.path)}
                                        sx={{
                                            py: 0,
                                            '&:hover': {
                                                bgcolor: theme.palette.primary.light
                                            }
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <item.icon size={20} stroke={1.5} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body2" fontWeight={500}>
                                                    {item.title}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                    {item.description}
                                                </Typography>
                                            }
                                        />
                                    </ListItemButton>
                                    {index < filteredItems.length - 1 && <Divider />}
                                </Box>
                            ))}
                        </List>
                    </Card>
                )}

                {/* No results message */}
                {value && filteredItems.length === 0 && (
                    <Card
                        sx={{
                            position: 'absolute',
                            top: '110%',
                            left: 0,
                            right: 0,
                            zIndex: 1200,
                            ml: 2,
                            p: 2,
                            boxShadow: theme.shadows[8]
                        }}
                    >
                        <Typography variant="body2" color="textSecondary" align="center">
                            No pages found for "{value}"
                        </Typography>
                    </Card>
                )}
            </Box>
        </>
    );
}

HeaderAvatarComponent.propTypes = { children: PropTypes.node, others: PropTypes.any };
MobileSearch.propTypes = {
    value: PropTypes.string,
    setValue: PropTypes.func,
    popupState: PropTypes.any,
    filteredItems: PropTypes.array,
    handleNavigate: PropTypes.func
};
