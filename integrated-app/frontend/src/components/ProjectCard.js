import React from 'react';
import { Card, Badge, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  // Calculate progress percentage
  const progressPercentage = project.fund_percentage || 0;
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="h-100 shadow-sm">
      {project.image ? (
        <Card.Img 
          variant="top" 
          src={project.image} 
          style={{ height: '180px', objectFit: 'cover' }}
        />
      ) : (
        <div 
          className="bg-light d-flex align-items-center justify-content-center"
          style={{ height: '180px' }}
        >
          <span className="text-muted">No Image</span>
        </div>
      )}
      
      <Card.Body className="d-flex flex-column">
        <div className="mb-2">
          {project.category && (
            <Badge bg="primary" className="me-2">{project.category}</Badge>
          )}
          <Badge bg="secondary">{project.blockchain_chain || 'BSC'}</Badge>
        </div>
        
        <Card.Title className="mb-2">{project.title}</Card.Title>
        
        <Card.Text className="mb-3 text-truncate">
          {project.description || 'No description available'}
        </Card.Text>
        
        <div className="mt-auto">
          <div className="d-flex justify-content-between mb-2">
            <small>{project.raised_amount || 0} {project.fund_currency}</small>
            <small>raised of {project.fund_amount} {project.fund_currency}</small>
          </div>
          
          <ProgressBar 
            now={progressPercentage} 
            variant={progressPercentage >= 100 ? "success" : "primary"} 
            className="mb-3"
          />
          
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="small text-muted">
              {project.number_of_donators || 0} Backers
            </div>
            <div className="small text-muted">
              Created: {formatDate(project.created_at)}
            </div>
          </div>
          
          <Link 
            to={`/projects/${project.id}`}
            className="btn btn-outline-primary w-100"
          >
            View Project
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProjectCard; 