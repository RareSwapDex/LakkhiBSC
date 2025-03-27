import React from 'react';
import { Box, Grid, Typography, LinearProgress } from '@mui/material';
import {
  TrendingUp,
  People,
  AttachMoney,
  Speed,
  Timeline,
} from '@mui/icons-material';

const StatCard = ({ icon: Icon, title, value, subtitle }) => (
  <Box sx={{ p: 2, textAlign: 'center' }}>
    <Icon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <Typography variant="h4" color="primary" gutterBottom>
      {value}
    </Typography>
    {subtitle && (
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    )}
  </Box>
);

const CampaignStats = ({ campaign }) => {
  const progress = (campaign.current_amount / campaign.fund_amount) * 100;
  const daysLeft = campaign.deadline
    ? Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  
  return (
    <Box>
      {/* Progress Bar */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Progress
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {progress.toFixed(1)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Box>
      
      {/* Stats Grid */}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <StatCard
            icon={AttachMoney}
            title="Total Raised"
            value={`$${campaign.current_amount.toLocaleString()}`}
            subtitle={`Goal: $${campaign.fund_amount.toLocaleString()}`}
          />
        </Grid>
        
        <Grid item xs={6}>
          <StatCard
            icon={People}
            title="Contributors"
            value={campaign.total_contributors}
            subtitle={`Average: $${campaign.average_contribution.toLocaleString()}`}
          />
        </Grid>
        
        <Grid item xs={6}>
          <StatCard
            icon={TrendingUp}
            title="Campaign Status"
            value={campaign.status}
            subtitle={daysLeft ? `${daysLeft} days left` : 'No deadline set'}
          />
        </Grid>
        
        <Grid item xs={6}>
          <StatCard
            icon={Timeline}
            title="Milestones"
            value={`${campaign.milestones.filter(m => m.completed).length}/${campaign.milestones.length}`}
            subtitle="Completed"
          />
        </Grid>
      </Grid>
      
      {/* Additional Stats */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Campaign Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2">
              Min Contribution: ${campaign.min_contribution || 'Not set'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">
              Max Contribution: ${campaign.max_contribution || 'Not set'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">
              Last Contribution: {campaign.last_contribution_date ? new Date(campaign.last_contribution_date).toLocaleDateString() : 'None yet'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">
              Verified: {campaign.is_verified ? 'Yes' : 'No'}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default CampaignStats; 