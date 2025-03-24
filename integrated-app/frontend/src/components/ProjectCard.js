import React from 'react';
import { Card, ProgressBar, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  // Calculate the funding progress percentage
  const progressPercentage = 
    project.fund_amount > 0 
      ? Math.min(100, (project.raised_amount / project.fund_amount) * 100) 
      : 0;

  return (
    <Card className="mb-4 h-100 shadow-sm">
      <Card.Img 
        variant="top" 
        src={project.thumbnail || 'https://via.placeholder.com/300x200'} 
        alt={project.title}
        style={{ height: '180px', objectFit: 'cover' }}
      />
      <Card.Body className="d-flex flex-column">
        <Card.Title>{project.title}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">by {project.owner_username}</Card.Subtitle>
        <Card.Text className="text-truncate">
          {project.head}
        </Card.Text>
        
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small>{project.raised_amount.toFixed(2)} raised</small>
            <small>{progressPercentage.toFixed(0)}%</small>
          </div>
          <ProgressBar 
            now={progressPercentage} 
            variant={progressPercentage >= 100 ? "success" : "primary"}
            className="mb-3"
          />
          
          <div className="d-flex justify-content-between">
            <Button 
              as={Link} 
              to={`/projects/${project.id}`} 
              variant="outline-primary"
              size="sm"
            >
              View Details
            </Button>
            
            {project.live && (
              <Button 
                as={Link} 
                to={`/donate/${project.id}`} 
                variant="primary"
                size="sm"
              >
                Donate
              </Button>
            )}
          </div>
        </div>
      </Card.Body>
      <Card.Footer className="text-muted">
        <small>
          {project.live 
            ? 'Campaign is live' 
            : 'Campaign is not yet live'}
        </small>
      </Card.Footer>
    </Card>
  );
};

export default ProjectCard; 