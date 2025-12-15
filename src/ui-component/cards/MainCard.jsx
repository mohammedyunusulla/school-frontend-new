// material-ui
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

// constant
const headerStyle = {
    '& .MuiCardHeader-action': { mr: 0 }
};

const MainCard = function MainCard({
    border = true, // Changed default to true
    boxShadow,
    children,
    content = true,
    contentClass = '',
    contentSX = {},
    headerSX = {},
    darkTitle,
    secondary,
    shadow,
    sx = {},
    title,
    ref,
    ...others
}) {
    const defaultShadow = '0 2px 14px 0 rgb(32 40 45 / 8%)';

    return (
        <Card
            ref={ref}
            {...others}
            sx={{
                border: border ? '1px solid' : 'none',
                borderColor: '#2196f3', // Blue border color
                borderTop: border ? '5px solid #2196f3' : 'none', // Thicker top border
                borderRadius: { xs: 0, sm: '12px' }, // No border radius on mobile, rounded on tablet+
                backgroundColor: '#ffffff',
                ':hover': {
                    boxShadow: boxShadow ? shadow || defaultShadow : 'inherit'
                },
                // Optional: Add a subtle shadow for depth
                boxShadow: { xs: 'none', sm: '0 1px 3px rgba(0, 0, 0, 0.1)' },
                // Remove side borders on mobile for edge-to-edge design
                borderLeft: { xs: 'none', sm: border ? '1px solid #2196f3' : 'none' },
                borderRight: { xs: 'none', sm: border ? '1px solid #2196f3' : 'none' },
                ...sx
            }}
        >
            {/* card header and action */}
            {!darkTitle && title && (
                <CardHeader
                    sx={{
                        ...headerStyle,
                        ...headerSX,
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1.5, sm: 2 },
                        '& .MuiCardHeader-title': {
                            fontSize: { xs: '1rem', sm: '1.125rem' }
                        }
                    }}
                    title={title}
                    action={secondary}
                />
            )}
            {darkTitle && title && (
                <CardHeader
                    sx={{
                        ...headerStyle,
                        ...headerSX,
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1.5, sm: 2 }
                    }}
                    title={
                        <Typography
                            variant="h3"
                            sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' } }}
                        >
                            {title}
                        </Typography>
                    }
                    action={secondary}
                />
            )}

            {/* content & header divider */}
            {title && <Divider />}

            {/* card content */}
            {content && (
                <CardContent
                    sx={{
                        px: { xs: 2, sm: 3 },
                        py: { xs: 2, sm: 3 },
                        ...contentSX
                    }}
                    className={contentClass}
                >
                    {children}
                </CardContent>
            )}
            {!content && children}
        </Card>
    );
};

export default MainCard;
