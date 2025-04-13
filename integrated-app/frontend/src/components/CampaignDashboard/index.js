import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Grid, Paper, Typography, CircularProgress, Alert, Snackbar, useTheme, useMediaQuery, Container, Tabs, Tab } from '@mui/material';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useCampaignData } from '../../hooks/useCampaignData';
import MilestoneProgress from '../MilestoneProgress';
import ContributionChart from '../ContributionChart';
import CampaignStats from '../CampaignStats';
import DonorList from '../DonorList';
import CampaignOwnerControls from '../CampaignOwnerControls';
import CampaignAnalytics from '../CampaignAnalytics';
import MobileCampaignView from '../MobileCampaignView';
import CampaignUpdates from '../CampaignUpdates';
import CampaignComments from '../CampaignComments';
import CampaignShare from '../CampaignShare';
import axios from 'axios';

const CampaignDashboard = () => {
  const { campaignId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [campaignData, setCampaignData] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState([]);
  
  // WebSocket connection for real-time updates
  const { lastMessage, isConnected, error: wsError } = useWebSocket(`ws://localhost:8000/ws/campaigns/${campaignId}/`);
  
  // Fetch campaign data
  const { data, error: dataError, loading, updateCampaignData, addContribution } = useCampaignData(campaignId);
  
  useEffect(() => {
    if (data) {
      setCampaignData(data);
      setContributions(data.contributions || []);
    }
  }, [data]);
  
  useEffect(() => {
    if (lastMessage) {
      const message = JSON.parse(lastMessage);
      switch (message.type) {
        case 'contribution_update':
          setContributions(prev => [...prev, message.contribution]);
          setNotification({
            open: true,
            message: `New contribution of $${message.contribution.amount_usd} received!`,
            severity: 'success'
          });
          break;
        case 'milestone_update':
          setCampaignData(prev => ({
            ...prev,
            milestones: prev.milestones.map(m =>
              m.id === message.milestone.id ? message.milestone : m
          )}));
          setNotification({
            open: true,
            message: `Milestone "${message.milestone.title}" updated!`,
            severity: 'info'
          });
          break;
        case 'campaign_update':
          setCampaignData(prev => ({ ...prev, ...message.campaign }));
          setNotification({
            open: true,
            message: 'Campaign details updated!',
            severity: 'info'
          });
          break;
        default:
          console.warn('Unknown message type:', message.type);
      }
    }
  }, [lastMessage]);

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }
  
  if (dataError) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Error loading campaign data: {dataError}
        </Alert>
      </Box>
    );
  }
  
  if (!campaignData) {
    return (
      <Box p={3}>
        <Alert severity="warning">
          Campaign not found
        </Alert>
      </Box>
    );
  }

  // Render mobile view
  if (isMobile) {
    return (
      <Box>
        <MobileCampaignView campaign={campaignData} />
        {(campaignData.is_owner || campaignData.is_contract_owner) && (
          <Box sx={{ p: 2 }}>
            <CampaignOwnerControls
              campaign={campaignData}
              onUpdate={() => {
                // Refresh campaign data
                updateCampaignData();
              }}
            />
          </Box>
        )}
      </Box>
    );
  }
  
  // Render desktop view
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Real-time updates are currently unavailable. Please refresh the page to see the latest updates.
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h4" gutterBottom>
              {campaignData.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" paragraph>
              {campaignData.description}
            </Typography>
            <CampaignShare campaign={campaignData} />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <CampaignStats campaign={campaignData} />
        </Grid>

        {(campaignData.is_owner || campaignData.is_contract_owner) && (
          <Grid item xs={12}>
            <CampaignOwnerControls 
              campaign={campaignData} 
              onUpdate={() => {
                // Refresh campaign data
                updateCampaignData();
              }} 
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              <Tab label="Updates" />
              <Tab label="Comments" />
              {(campaignData.is_owner || campaignData.is_contract_owner) && <Tab label="Analytics" />}
            </Tabs>

            {activeTab === 0 && (
              <CampaignUpdates
                campaign={campaignData}
                onUpdate={() => {
                  // Refresh campaign data
                  updateCampaignData();
                }}
              />
            )}

            {activeTab === 1 && (
              <CampaignComments
                campaign={campaignData}
                onUpdate={() => {
                  // Refresh campaign data
                  updateCampaignData();
                }}
              />
            )}

            {activeTab === 2 && (campaignData.is_owner || campaignData.is_contract_owner) && (
              <CampaignAnalytics campaign={campaignData} />
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>

      {notifications.map(notification => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={6000}
          onClose={() => {
            setNotifications(prev =>
              prev.filter(n => n.id !== notification.id)
            );
          }}
        >
          <Alert
            severity={notification.severity}
            onClose={() => {
              setNotifications(prev =>
                prev.filter(n => n.id !== notification.id)
              );
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}

      <Snackbar
        open={!!dataError}
        autoHideDuration={6000}
        onClose={() => {
          // Handle error closure
        }}
      >
        <Alert severity="error" onClose={() => {
          // Handle error closure
        }}>
          {dataError}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CampaignDashboard; 