import React from 'react';

/**
 * Component to display project status in a banner
 * Resembles RareFnd's design with colored banner
 */
const ProjectStatusBanner = ({ project }) => {
  // Determine project status
  const getProjectStatus = () => {
    if (!project) return { text: 'Loading...', color: '#6c7fdd' };

    // Project is active
    if (project.status === 'active') {
      return { text: 'Project Live', color: '#09ce00' };
    }
    
    // Project is completed and funded
    if (project.status === 'completed' && project.raised_amount >= project.fund_amount) {
      return { text: 'Successfully Funded', color: '#09ce00' };
    }
    
    // Project is completed but not funded
    if (project.status === 'completed' && project.raised_amount < project.fund_amount) {
      return { text: 'Funding Goal Not Reached', color: '#ce0909' };
    }
    
    // Project is in draft state
    if (project.status === 'draft') {
      return { text: 'Coming Soon', color: '#6c7fdd' };
    }
    
    // Project is cancelled
    if (project.status === 'cancelled') {
      return { text: 'Project Cancelled', color: '#ce0909' };
    }
    
    // Default case
    return { text: 'Project Status Unknown', color: '#6c7fdd' };
  };
  
  const status = getProjectStatus();
  
  return (
    <div 
      style={{
        width: '100%',
        height: '30px',
        color: 'white',
        backgroundColor: status.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold'
      }}
    >
      {status.text}
    </div>
  );
};

export default ProjectStatusBanner; 