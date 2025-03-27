import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VerifiedIcon from '@mui/icons-material/Verified';

const DonorList = ({ contributions }) => {
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Recent Contributors
      </Typography>
      <List>
        {contributions.map((contribution) => (
          <ListItem key={contribution.id} divider>
            <ListItemAvatar>
              <Avatar>
                <AccountCircleIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1">
                    {contribution.contributor_name || 'Anonymous'}
                  </Typography>
                  {contribution.verified && (
                    <Chip
                      icon={<VerifiedIcon />}
                      label="Verified"
                      size="small"
                      color="success"
                    />
                  )}
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {formatAmount(contribution.amount_usd)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(contribution.created_at)}
                  </Typography>
                </Box>
              }
            />
            {contribution.message && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, fontStyle: 'italic' }}
              >
                "{contribution.message}"
              </Typography>
            )}
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default DonorList; 