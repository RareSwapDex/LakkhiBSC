import React from 'react';
import { Line } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';

const ContributionChart = ({ contributions }) => {
  // Process contributions data for the chart
  const chartData = React.useMemo(() => {
    // Group contributions by date
    const groupedData = contributions.reduce((acc, contribution) => {
      const date = new Date(contribution.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + parseFloat(contribution.amount_usd);
      return acc;
    }, {});
    
    // Sort dates
    const sortedDates = Object.keys(groupedData).sort();
    
    // Calculate cumulative amounts
    let cumulative = 0;
    const cumulativeData = sortedDates.map(date => {
      cumulative += groupedData[date];
      return cumulative;
    });
    
    return {
      labels: sortedDates,
      datasets: [
        {
          label: 'Daily Contributions',
          data: sortedDates.map(date => groupedData[date]),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
          fill: false,
        },
        {
          label: 'Cumulative Amount',
          data: cumulativeData,
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1,
          fill: false,
        },
      ],
    };
  }, [contributions]);
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Contribution Trends',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`,
        },
      },
    },
  };
  
  return (
    <Box sx={{ height: 300 }}>
      <Line data={chartData} options={options} />
    </Box>
  );
};

export default ContributionChart; 