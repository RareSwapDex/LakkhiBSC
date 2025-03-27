import React from 'react';
import { Box, Typography, LinearProgress, Paper, Grid } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PendingIcon from '@mui/icons-material/Pending';

const MilestoneProgress = ({ campaign }) => {
  const calculateProgress = (milestone) => {
    const total = parseFloat(campaign.fund_amount);
    const current = parseFloat(campaign.fund_spend || 0);
    const milestoneAmount = parseFloat(milestone.amount);
    return Math.min((current / milestoneAmount) * 100, 100);
  };

  const getMilestoneStatus = (milestone) => {
    const current = parseFloat(campaign.fund_spend || 0);
    const milestoneAmount = parseFloat(milestone.amount);
    
    if (current >= milestoneAmount) {
      return 'completed';
    } else if (current > 0) {
      return 'in_progress';
    }
    return 'pending';
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Campaign Milestones
      </Typography>
      <Timeline>
        {campaign.milestones.map((milestone, index) => {
          const progress = calculateProgress(milestone);
          const status = getMilestoneStatus(milestone);
          
          return (
            <TimelineItem key={milestone.id}>
              <TimelineSeparator>
                <TimelineDot color={status === 'completed' ? 'success' : status === 'in_progress' ? 'primary' : 'grey'}>
                  {status === 'completed' ? <CheckCircleIcon /> : 
                   status === 'in_progress' ? <PendingIcon /> : 
                   <RadioButtonUncheckedIcon />}
                </TimelineDot>
                {index < campaign.milestones.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {milestone.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Target: ${parseFloat(milestone.amount).toLocaleString()}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {progress.toFixed(1)}% Complete
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {milestone.description}
                </Typography>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </Paper>
  );
};

export default MilestoneProgress; 