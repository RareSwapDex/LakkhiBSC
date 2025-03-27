import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import {
  EmailShareButton,
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  TelegramShareButton,
  WhatsappShareButton,
  EmailIcon,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  TelegramIcon,
  WhatsappIcon,
} from 'react-share';

/**
 * Component for social media sharing buttons
 * Similar to RareFnd's sharing options
 */
const ProjectShareButtons = ({ project }) => {
  if (!project) return null;
  
  // Current URL for sharing
  const shareUrl = window.location.href;
  const title = `Check out this project: ${project.title}`;
  const iconSize = 32;
  
  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title className="mb-3">Share this project</Card.Title>
        <Row className="justify-content-center">
          <Col xs="auto" className="p-1">
            <FacebookShareButton url={shareUrl} quote={title}>
              <FacebookIcon size={iconSize} round={true} />
            </FacebookShareButton>
          </Col>
          <Col xs="auto" className="p-1">
            <TwitterShareButton url={shareUrl} title={title}>
              <TwitterIcon size={iconSize} round={true} />
            </TwitterShareButton>
          </Col>
          <Col xs="auto" className="p-1">
            <LinkedinShareButton url={shareUrl} title={title}>
              <LinkedinIcon size={iconSize} round={true} />
            </LinkedinShareButton>
          </Col>
          <Col xs="auto" className="p-1">
            <TelegramShareButton url={shareUrl} title={title}>
              <TelegramIcon size={iconSize} round={true} />
            </TelegramShareButton>
          </Col>
          <Col xs="auto" className="p-1">
            <WhatsappShareButton url={shareUrl} title={title}>
              <WhatsappIcon size={iconSize} round={true} />
            </WhatsappShareButton>
          </Col>
          <Col xs="auto" className="p-1">
            <EmailShareButton url={shareUrl} subject={title} body={`Check out this project: ${shareUrl}`}>
              <EmailIcon size={iconSize} round={true} />
            </EmailShareButton>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ProjectShareButtons; 