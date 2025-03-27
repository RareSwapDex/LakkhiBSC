import React from 'react';
import { Card, Badge } from 'react-bootstrap';

const IncentiveCard = ({ incentive, onSelect, isSelected }) => {
  const handleSelect = () => {
    onSelect(incentive.id);
  };

  return (
    <Card 
      className={`mb-3 cursor-pointer ${isSelected ? 'border-primary' : ''}`}
      onClick={handleSelect}
      style={{ 
        cursor: 'pointer',
        boxShadow: isSelected ? '0 0 0 2px #0d6efd' : 'none',
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">{incentive.title}</h5>
          <Badge bg={isSelected ? 'primary' : 'secondary'}>
            ${incentive.price}
          </Badge>
        </div>
        
        <Card.Text>
          {incentive.description}
        </Card.Text>
        
        {incentive.limit && (
          <div className="mt-2 text-muted">
            <small>
              {incentive.claimed ? `${incentive.claimed} claimed` : ''} 
              {incentive.claimed && incentive.limit ? ' / ' : ''}
              {incentive.limit ? `${incentive.limit} available` : ''}
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default IncentiveCard; 