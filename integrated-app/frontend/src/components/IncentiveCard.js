import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';

const IncentiveCard = ({ incentive, onSelect, isSelected = false }) => {
  // Calculate if the incentive is sold out
  const isSoldOut = incentive.available_items <= incentive.reserved;
  
  // Format the delivery date
  const formatDeliveryDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <Card className={`mb-3 ${isSelected ? 'border-primary' : ''}`}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <Card.Title>{incentive.title}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              Estimated delivery: {formatDeliveryDate(incentive.estimated_delivery)}
            </Card.Subtitle>
          </div>
          <h5>
            <Badge bg="primary">${incentive.price.toFixed(2)}</Badge>
          </h5>
        </div>
        
        <Card.Text>{incentive.description}</Card.Text>
        
        {incentive.included_incentives?.length > 0 && (
          <div className="mb-3">
            <strong>Includes:</strong>
            <ul className="mb-0">
              {incentive.included_incentives.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            {isSoldOut 
              ? 'Sold out!' 
              : `${incentive.available_items - incentive.reserved} of ${incentive.available_items} remaining`
            }
          </small>
          
          <Button
            variant={isSelected ? "primary" : "outline-primary"}
            onClick={() => onSelect(incentive.id)}
            disabled={isSoldOut}
          >
            {isSelected ? 'Selected' : 'Select'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default IncentiveCard; 