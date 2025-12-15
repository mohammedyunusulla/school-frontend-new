import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const StyledCard = styled(Card)(({ bgcolor, iconcolor }) => ({
    height: '100%',
    background: `linear-gradient(135deg, ${bgcolor}15 0%, ${bgcolor}05 100%)`,
    borderRadius: '20px',
    position: 'relative',
    overflow: 'hidden',
    border: `1px solid ${bgcolor}20`,
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 24px ${bgcolor}25`,
        border: `1px solid ${bgcolor}40`,
        '& .icon-gradient': {
            transform: 'scale(1.05)',
            boxShadow: `0 8px 20px ${iconcolor}30`
        },
        '&::before': {
            opacity: 1
        }
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(135deg, ${bgcolor}08 0%, transparent 50%, ${iconcolor}08 100%)`,
        opacity: 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none'
    }
}));

const IconGradient = styled(Box)(({ iconcolor, bgcolor }) => ({
    width: 60,
    height: 60,
    borderRadius: '16px',
    background: `linear-gradient(135deg, ${iconcolor} 0%, ${bgcolor} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    boxShadow: `0 4px 12px ${iconcolor}25`,
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        animation: `${shimmer} 3s infinite`,
        backgroundSize: '1000px 100%'
    }
}));

const ValueText = styled(Typography)(({ iconcolor, bgcolor }) => ({
    fontWeight: 800,
    fontSize: '2rem',
    background: `linear-gradient(135deg, ${iconcolor} 0%, ${bgcolor} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: 1.2,
    letterSpacing: '-0.02em'
}));

const StatsCard = ({
    title,
    value,
    icon: Icon,
    iconColor,
    subtitle,
    bgColor
}) => {
    return (
        <StyledCard bgcolor={bgColor} iconcolor={iconColor}>
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    {/* Icon on the left */}
                    <IconGradient
                        className="icon-gradient"
                        iconcolor={iconColor}
                        bgcolor={bgColor}
                    >
                        {Icon && <Icon size={30} strokeWidth={2.5} />}
                    </IconGradient>

                    {/* Content on the right */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'text.secondary',
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                mb: 0.5,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                opacity: 0.7
                            }}
                        >
                            {title}
                        </Typography>
                        <ValueText iconcolor={iconColor} bgcolor={bgColor}>
                            {value}
                        </ValueText>
                        {subtitle && (
                            <Typography
                                variant="caption"
                                sx={{
                                    color: bgColor,
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    display: 'inline-block',
                                    mt: 0.5,
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: '6px',
                                    background: `${bgColor}15`,
                                    border: `1px solid ${bgColor}25`
                                }}
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </CardContent>
        </StyledCard>
    );
};

export default StatsCard;
