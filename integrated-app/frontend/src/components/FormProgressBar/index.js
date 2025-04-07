import React from 'react';
import { ProgressBar, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import './styles.css';

const FormProgressBar = ({ 
  sections = [], 
  activeSection, 
  onSectionClick 
}) => {
  // Calculate overall progress
  const completedSections = sections.filter(section => section.progress === 100).length;
  const overallProgress = Math.round((completedSections / sections.length) * 100);
  
  // Determine if a section can be clicked (previous sections must be completed)
  const canClickSection = (sectionIndex) => {
    // Always allow clicking the active section
    if (sections[sectionIndex].id === activeSection) return true;
    
    // Get index of active section
    const activeIndex = sections.findIndex(s => s.id === activeSection);
    
    // Allow clicking previous sections
    if (sectionIndex < activeIndex) return true;
    
    // Allow clicking the next section only if current is complete
    if (sectionIndex === activeIndex + 1) {
      return sections[activeIndex].progress === 100;
    }
    
    // Check if all sections up to this one are complete
    for (let i = 0; i < sectionIndex; i++) {
      if (sections[i].progress !== 100) return false;
    }
    
    return true;
  };
  
  return (
    <div className="form-progress-container">
      <div className="overall-progress mb-2">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="progress-label">Overall Progress</span>
          <span className="progress-percentage">{overallProgress}%</span>
        </div>
        <ProgressBar now={overallProgress} variant="success" className="mb-2" />
      </div>
      
      <div className="section-progress">
        <div className="section-pills">
          {sections.map((section, index) => (
            <Button
              key={section.id}
              variant={section.id === activeSection ? 'primary' : 'outline-secondary'}
              className={`section-pill ${section.progress === 100 ? 'completed' : ''}`}
              onClick={() => canClickSection(index) && onSectionClick(section.id)}
              disabled={!canClickSection(index)}
            >
              <div className="section-status">
                {section.progress === 100 ? (
                  <FontAwesomeIcon icon={faCheck} className="section-icon completed" />
                ) : (
                  <FontAwesomeIcon icon={faCircle} className="section-icon" />
                )}
              </div>
              <div className="section-info">
                <div className="section-label">{section.label}</div>
                <ProgressBar 
                  now={section.progress} 
                  variant={section.progress === 100 ? 'success' : 'primary'} 
                  className="section-progress-bar" 
                />
              </div>
            </Button>
          ))}
        </div>
      </div>
      
      {overallProgress < 100 && (
        <div className="progress-help-text mt-2">
          <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
          <small>Complete all required fields in each section to proceed</small>
        </div>
      )}
    </div>
  );
};

export default FormProgressBar; 