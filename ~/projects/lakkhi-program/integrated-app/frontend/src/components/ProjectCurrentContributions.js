import React, { useState, useEffect } from 'react';
import { Row, Col, ProgressBar } from 'react-bootstrap';
import axios from 'axios';
import Spinner from 'react-bootstrap/Spinner';

/**
 * Component to display project's current contributions with animated progress bar
 * Resembles RareFnd's design with gradient background
 */
const ProjectCurrentContributions = ({ project, tokenData }) => {
  const [usdRaisedAmount, setUsdRaisedAmount] = useState(0);
  const [tokenRaisedAmount, setTokenRaisedAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Get USD and token amounts
  useEffect(() => {
    const fetchProjectStats = async () => {
      try {
        if (!project?.id) return;
        
        // Fetch latest project data
        const response = await axios.get(`${process.env.REACT_APP_API_URL || ''}/api/projects/${project.id}/`);
        
        if (response.data && response.data.success) {
          const projectData = response.data.project;
          setUsdRaisedAmount(Number(projectData.raised_amount || 0));
          
          // Calculate token amount if we have token price data
          if (tokenData && tokenData.price) {
            const tokenAmount = Number(projectData.raised_amount) / Number(tokenData.price);
            setTokenRaisedAmount(tokenAmount);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching project stats:', error);
        setLoading(false);
      }
    };

    fetchProjectStats();
    
    // Set up interval to refresh data every 5 seconds
    const interval = setInterval(() => {
      setRefreshKey(prevKey => prevKey + 1);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [project?.id, tokenData, refreshKey]);

  const formatCurrency = (amount, currency = 'USD') => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatToken = (amount, symbol = 'Tokens') => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 6,
      maximumFractionDigits: 6
    });
  };

  if (loading || !project) {
    return (
      <div 
        className="project-current-contributions p-5 text-center"
        style={{
          background: "linear-gradient(to right, #6c7fdd 0%, #cd77d3 54.09%, #e4bad0 100%)",
          color: "white",
        }}
      >
        <Spinner animation="border" role="status" variant="light">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Calculate progress percentage
  const progressPercentage = project.fund_amount 
    ? Math.min(100, (usdRaisedAmount / Number(project.fund_amount)) * 100) 
    : 0;

  return (
    <div 
      className="project-current-contributions p-5"
      style={{
        background: "linear-gradient(to right, #6c7fdd 0%, #cd77d3 54.09%, #e4bad0 100%)",
        color: "white",
      }}
    >
      <Row className="justify-content-md-center">
        <Col md={12} className="text-center">
          <h1 className="display-6 fw-bold" style={{ color: "white" }}>
            ${formatCurrency(usdRaisedAmount)} / ${formatCurrency(Number(project.fund_amount))}
          </h1>
          
          {tokenData && (
            <div className="mb-3" style={{ color: "white" }}>
              {formatToken(tokenRaisedAmount)} / {formatToken(Number(project.fund_amount) / Number(tokenData.price))} {tokenData.symbol}
            </div>
          )}
          
          <ProgressBar
            animated
            variant="dark"
            now={progressPercentage}
            label={`${progressPercentage.toFixed(2)}%`}
            className="mx-auto"
            style={{ width: "50%", height: "20px" }}
          />
        </Col>
      </Row>

      <Row className="justify-content-md-center mt-5">
        <Col md={6} className="text-center mt-1">
          <div className="h3 fw-bold text-light fw-bold">
            Number of Backers
          </div>
          <div className="display-6 fw-bold" style={{ color: "white" }}>
            {project.number_of_donators || 0}
          </div>
        </Col>
        <Col md={6} className="text-center mt-1">
          <div className="h3 fw-bold text-light fw-bold">
            Days Left
          </div>
          <div className="display-6 fw-bold" style={{ color: "white" }}>
            {project.days_left || 'N/A'}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ProjectCurrentContributions; 