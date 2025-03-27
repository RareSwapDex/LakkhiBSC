import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Timeline as TimelineIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

const CampaignAnalytics = ({ campaign }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [campaign.id]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/campaigns/${campaign.id}/analytics/`);
      setAnalytics(response.data);
    } catch (err) {
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExportData = async (format) => {
    try {
      const response = await axios.get(
        `/api/campaigns/${campaign.id}/analytics/export/`,
        {
          params: { format },
          responseType: 'blob',
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `campaign-analytics.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export analytics data');
    }
    handleMenuClose();
  };

  const renderMetricCard = (title, value, icon, subtitle = '') => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" gutterBottom>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const renderContributionTrend = () => {
    if (!analytics?.contributionTrend) return null;

    const data = {
      labels: analytics.contributionTrend.map(d => new Date(d.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Daily Contributions',
          data: analytics.contributionTrend.map(d => d.amount),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Contribution Trend',
        },
      },
    };

    return <Line data={data} options={options} />;
  };

  const renderDonorDistribution = () => {
    if (!analytics?.donorDistribution) return null;

    const data = {
      labels: analytics.donorDistribution.map(d => d.range),
      datasets: [
        {
          label: 'Number of Donors',
          data: analytics.donorDistribution.map(d => d.count),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Donor Distribution by Contribution Amount',
        },
      },
    };

    return <Bar data={data} options={options} />;
  };

  const renderPaymentMethodDistribution = () => {
    if (!analytics?.paymentMethodDistribution) return null;

    const data = {
      labels: analytics.paymentMethodDistribution.map(d => d.method),
      datasets: [
        {
          data: analytics.paymentMethodDistribution.map(d => d.amount),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
          ],
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Payment Method Distribution',
        },
      },
    };

    return <Pie data={data} options={options} />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Alert severity="error">
        No analytics data available
      </Alert>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Campaign Analytics
          </Typography>
          <Box>
            <Tooltip title="Export Data">
              <IconButton onClick={handleMenuOpen}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleExportData('csv')}>Export as CSV</MenuItem>
              <MenuItem onClick={() => handleExportData('pdf')}>Export as PDF</MenuItem>
              <MenuItem onClick={() => handleExportData('excel')}>Export as Excel</MenuItem>
            </Menu>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            {renderMetricCard(
              'Total Raised',
              `$${analytics.totalRaised.toLocaleString()}`,
              <MoneyIcon color="primary" />,
              `${((analytics.totalRaised / campaign.fund_amount) * 100).toFixed(1)}% of goal`
            )}
          </Grid>
          <Grid item xs={12} md={3}>
            {renderMetricCard(
              'Total Donors',
              analytics.totalDonors.toLocaleString(),
              <PeopleIcon color="primary" />,
              `${analytics.newDonorsThisWeek} new this week`
            )}
          </Grid>
          <Grid item xs={12} md={3}>
            {renderMetricCard(
              'Average Donation',
              `$${analytics.averageDonation.toLocaleString()}`,
              <TrendingUpIcon color="primary" />,
              `${analytics.donationGrowth}% vs last week`
            )}
          </Grid>
          <Grid item xs={12} md={3}>
            {renderMetricCard(
              'Campaign Progress',
              `${analytics.campaignProgress}%`,
              <TimelineIcon color="primary" />,
              `${analytics.daysLeft} days remaining`
            )}
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              {renderContributionTrend()}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              {renderDonorDistribution()}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              {renderPaymentMethodDistribution()}
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Campaign Milestones
              </Typography>
              {analytics.milestones.map((milestone, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {milestone.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {milestone.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={milestone.progress}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CampaignAnalytics; 