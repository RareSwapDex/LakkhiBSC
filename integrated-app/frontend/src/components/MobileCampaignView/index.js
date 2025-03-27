import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  AttachMoney,
  People,
  CalendarToday,
  TrendingUp,
  CheckCircle,
  Pending,
  Schedule,
} from '@mui/icons-material';

const MobileCampaignView = ({ campaign }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'success';
    if (progress >= 75) return 'info';
    if (progress >= 50) return 'warning';
    return 'error';
  };

  const getMilestoneStatus = (milestone) => {
    const current = parseFloat(campaign.fund_spend || 0);
    const target = parseFloat(milestone.amount);
    
    if (current >= target) return 'completed';
    if (current > 0) return 'in_progress';
    return 'pending';
  };

  const renderMilestoneStatus = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Chip
            icon={<CheckCircle />}
            label="Completed"
            color="success"
            size="small"
          />
        );
      case 'in_progress':
        return (
          <Chip
            icon={<TrendingUp />}
            label="In Progress"
            color="primary"
            size="small"
          />
        );
      default:
        return (
          <Chip
            icon={<Schedule />}
            label="Pending"
            color="default"
            size="small"
          />
        );
    }
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      {/* Campaign Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          {campaign.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Created by {campaign.owner_name}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {campaign.description}
          </Typography>
        </Box>
      </Paper>

      {/* Progress Section */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AttachMoney sx={{ mr: 1 }} />
          <Typography variant="h6">
            Campaign Progress
          </Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">
              ${campaign.current_amount.toLocaleString()} raised
            </Typography>
            <Typography variant="body2">
              {((campaign.current_amount / campaign.fund_amount) * 100).toFixed(1)}%
            </Typography>
          </Box>
          <Box
            sx={{
              width: '100%',
              height: 8,
              bgcolor: 'grey.200',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: `${(campaign.current_amount / campaign.fund_amount) * 100}%`,
                height: '100%',
                bgcolor: `${getProgressColor(
                  (campaign.current_amount / campaign.fund_amount) * 100
                )}.main`,
                transition: 'width 0.3s ease-in-out',
              }}
            />
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <People sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography variant="h6">
                {campaign.total_contributors}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contributors
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <CalendarToday sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography variant="h6">
                {campaign.days_remaining}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Days Left
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Milestones Section */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Campaign Milestones
        </Typography>
        <List>
          {campaign.milestones.map((milestone, index) => {
            const status = getMilestoneStatus(milestone);
            const progress = Math.min(
              (campaign.current_amount / milestone.amount) * 100,
              100
            );
            
            return (
              <React.Fragment key={milestone.id}>
                <ListItem>
                  <ListItemIcon>
                    {status === 'completed' ? (
                      <CheckCircle color="success" />
                    ) : status === 'in_progress' ? (
                      <TrendingUp color="primary" />
                    ) : (
                      <Pending color="disabled" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={milestone.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          ${milestone.amount.toLocaleString()}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Box
                            sx={{
                              width: '100%',
                              height: 4,
                              bgcolor: 'grey.200',
                              borderRadius: 2,
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                width: `${progress}%`,
                                height: '100%',
                                bgcolor: `${getProgressColor(progress)}.main`,
                                transition: 'width 0.3s ease-in-out',
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    }
                  />
                  {renderMilestoneStatus(status)}
                </ListItem>
                {index < campaign.milestones.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </List>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<AttachMoney />}
        >
          Contribute
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<People />}
        >
          Share
        </Button>
      </Box>

      {/* Recent Contributions */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recent Contributions
        </Typography>
        <List>
          {campaign.recent_contributions?.map((contribution, index) => (
            <React.Fragment key={contribution.id}>
              <ListItem>
                <ListItemIcon>
                  <AttachMoney color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={`$${contribution.amount.toLocaleString()}`}
                  secondary={
                    <Box>
                      <Typography variant="body2">
                        {contribution.contributor_name || 'Anonymous'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(contribution.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < campaign.recent_contributions.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default MobileCampaignView; 