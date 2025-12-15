import PropTypes from 'prop-types';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import Breadcrumbs from '../../ui-component/extended/Breadcrumbs';

const HeaderCard = ({
    heading,
    breadcrumbLinks = [],
    buttonvariant,
    buttonColor,
    buttonText,
    onButtonClick,
    buttonIcon,
    gradient = 'linear-gradient(135deg, #3822aaff 0%, #1a91c4ff 50%, #47534fff 100%)',
    sx = {}
}) => {
    return (
        <Card sx={{ mb: 3, background: gradient, ...sx }}>
            <CardContent sx={{
                p: { xs: 2, sm: 2, md: 3 },
                '&:last-child': { pb: { xs: 2, sm: 2, md: 3 } }
            }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 1.5, sm: 2 }
                    }}
                >
                    <Box sx={{ flex: 1, width: '100%' }}>
                        <Typography
                            variant="h3"
                            fontWeight="600"
                            color="white"
                            sx={{
                                mb: -0.5,
                                fontSize: { xs: '1.25rem', sm: '1.5rem', },
                                wordBreak: 'break-word'
                            }}
                        >
                            {heading}
                        </Typography>
                        {breadcrumbLinks && breadcrumbLinks.length > 0 && (
                            <Breadcrumbs
                                custom={true}
                                links={breadcrumbLinks}
                                card={false}
                                divider={false}
                                rightAlign={false}
                                sx={{
                                    '& .MuiTypography-root': {
                                        color: 'rgba(255,255,255,0.9)',
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                    },
                                    '& a': {
                                        color: 'rgba(255,255,255,0.9)',
                                        '&:hover': {
                                            color: 'white'
                                        }
                                    },
                                    ml: { xs: 0, sm: 0.5 },
                                    mt: { xs: -1.5, sm: -1 }
                                }}
                            />
                        )}
                    </Box>

                    {(buttonText || buttonIcon) && (
                        <Button
                            variant={buttonvariant}
                            color={buttonColor}
                            onClick={onButtonClick}
                            startIcon={buttonIcon}
                            sx={{
                                whiteSpace: 'nowrap',
                                minWidth: { xs: '100%', sm: 'auto' },
                                mt: { xs: 1, sm: 0 }
                            }}
                        >
                            {buttonText}
                        </Button>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

HeaderCard.propTypes = {
    heading: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    breadcrumbLinks: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string.isRequired,
            to: PropTypes.string,
            icon: PropTypes.elementType
        })
    ),
    buttonvariant: PropTypes.string,
    buttonColor: PropTypes.string,
    buttonText: PropTypes.string,
    onButtonClick: PropTypes.func,
    buttonIcon: PropTypes.element,
    gradient: PropTypes.string,
    sx: PropTypes.object
};

export default HeaderCard;
