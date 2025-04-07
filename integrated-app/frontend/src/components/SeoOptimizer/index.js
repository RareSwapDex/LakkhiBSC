import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Accordion, ProgressBar, Alert, Tab, Tabs } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faLightbulb,
  faCheckCircle,
  faExclamationTriangle,
  faTimesCircle,
  faMagic,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faTwitter } from '@fortawesome/free-brands-svg-icons';
import './styles.css';

const SeoOptimizer = ({ 
  campaignData, 
  onChange,
  keywords = [] 
}) => {
  const [activeTab, setActiveTab] = useState('search');
  const [metaTitle, setMetaTitle] = useState(campaignData?.seo?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(campaignData?.seo?.metaDescription || '');
  const [socialTitle, setSocialTitle] = useState(campaignData?.seo?.socialTitle || '');
  const [socialDescription, setSocialDescription] = useState(campaignData?.seo?.socialDescription || '');
  const [focusKeyword, setFocusKeyword] = useState(campaignData?.seo?.focusKeyword || '');
  const [suggestedKeywords, setSuggestedKeywords] = useState(keywords);
  const [seoScore, setSeoScore] = useState(0);
  const [previewType, setPreviewType] = useState('google');
  const [analyses, setAnalyses] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [keywordDensity, setKeywordDensity] = useState(0);
  
  // Effect to update analysis when fields change
  useEffect(() => {
    analyzeSeo();
    // Update parent component
    onChange({
      metaTitle,
      metaDescription,
      socialTitle,
      socialDescription,
      focusKeyword
    });
  }, [metaTitle, metaDescription, socialTitle, socialDescription, focusKeyword]);
  
  // Generate default values if not provided
  useEffect(() => {
    if (!metaTitle && campaignData?.basics?.projectTitle) {
      setMetaTitle(campaignData.basics.projectTitle);
    }
    
    if (!metaDescription && campaignData?.basics?.projectDescription) {
      setMetaDescription(
        truncateText(campaignData.basics.projectDescription, 160)
      );
    }
    
    if (!socialTitle && campaignData?.basics?.projectTitle) {
      setSocialTitle(campaignData.basics.projectTitle);
    }
    
    if (!socialDescription && campaignData?.basics?.projectDescription) {
      setSocialDescription(
        truncateText(campaignData.basics.projectDescription, 200)
      );
    }
    
    if (!focusKeyword && campaignData?.basics?.category) {
      setFocusKeyword(campaignData.basics.category);
    }
    
    if (!suggestedKeywords.length && campaignData?.basics?.tags) {
      setSuggestedKeywords(campaignData.basics.tags);
    }
  }, [campaignData]);
  
  // Truncate text to a certain length
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    
    // Remove HTML tags if present
    const plainText = text.replace(/<[^>]*>?/gm, '');
    
    if (plainText.length <= maxLength) return plainText;
    
    // Find the last space before maxLength
    const lastSpace = plainText.substring(0, maxLength).lastIndexOf(' ');
    return plainText.substring(0, lastSpace) + '...';
  };
  
  // Analyze SEO effectiveness
  const analyzeSeo = () => {
    const newAnalyses = [];
    let score = 0;
    const totalChecks = 8;
    
    // Check meta title
    if (metaTitle) {
      if (metaTitle.length < 10) {
        newAnalyses.push({
          type: 'warning',
          message: 'Meta title is too short. Aim for 50-60 characters.',
        });
      } else if (metaTitle.length > 60) {
        newAnalyses.push({
          type: 'warning',
          message: 'Meta title is too long. Keep it under 60 characters.',
        });
      } else {
        newAnalyses.push({
          type: 'success',
          message: 'Meta title has a good length.',
        });
        score++;
      }
      
      // Check if title contains focus keyword
      if (focusKeyword && metaTitle.toLowerCase().includes(focusKeyword.toLowerCase())) {
        newAnalyses.push({
          type: 'success',
          message: 'Meta title contains your focus keyword.',
        });
        score++;
      } else if (focusKeyword) {
        newAnalyses.push({
          type: 'warning',
          message: 'Focus keyword is missing from the meta title.',
        });
      }
    } else {
      newAnalyses.push({
        type: 'error',
        message: 'Meta title is missing.',
      });
    }
    
    // Check meta description
    if (metaDescription) {
      if (metaDescription.length < 70) {
        newAnalyses.push({
          type: 'warning',
          message: 'Meta description is too short. Aim for 120-160 characters.',
        });
      } else if (metaDescription.length > 160) {
        newAnalyses.push({
          type: 'warning',
          message: 'Meta description is too long. Keep it under 160 characters.',
        });
      } else {
        newAnalyses.push({
          type: 'success',
          message: 'Meta description has a good length.',
        });
        score++;
      }
      
      // Check if description contains focus keyword
      if (focusKeyword && metaDescription.toLowerCase().includes(focusKeyword.toLowerCase())) {
        newAnalyses.push({
          type: 'success',
          message: 'Meta description contains your focus keyword.',
        });
        score++;
      } else if (focusKeyword) {
        newAnalyses.push({
          type: 'warning',
          message: 'Focus keyword is missing from the meta description.',
        });
      }
    } else {
      newAnalyses.push({
        type: 'error',
        message: 'Meta description is missing.',
      });
    }
    
    // Check social title
    if (socialTitle) {
      if (socialTitle.length < 10) {
        newAnalyses.push({
          type: 'warning',
          message: 'Social title is too short. Aim for 40-60 characters.',
        });
      } else if (socialTitle.length > 70) {
        newAnalyses.push({
          type: 'warning',
          message: 'Social title is too long. Keep it under 70 characters.',
        });
      } else {
        newAnalyses.push({
          type: 'success',
          message: 'Social title has a good length.',
        });
        score++;
      }
    } else {
      newAnalyses.push({
        type: 'warning',
        message: 'Social title is missing.',
      });
    }
    
    // Check social description
    if (socialDescription) {
      if (socialDescription.length < 70) {
        newAnalyses.push({
          type: 'warning',
          message: 'Social description is too short. Aim for 70-200 characters.',
        });
      } else if (socialDescription.length > 200) {
        newAnalyses.push({
          type: 'warning',
          message: 'Social description is too long. Keep it under 200 characters.',
        });
      } else {
        newAnalyses.push({
          type: 'success',
          message: 'Social description has a good length.',
        });
        score++;
      }
    } else {
      newAnalyses.push({
        type: 'warning',
        message: 'Social description is missing.',
      });
    }
    
    // Check focus keyword
    if (!focusKeyword) {
      newAnalyses.push({
        type: 'error',
        message: 'Focus keyword is missing.',
      });
    } else {
      newAnalyses.push({
        type: 'success',
        message: 'Focus keyword is set.',
      });
      score++;
    }
    
    // Calculate overall score percentage
    const scorePercentage = Math.round((score / totalChecks) * 100);
    setSeoScore(scorePercentage);
    setAnalyses(newAnalyses);
  };
  
  // Generate SEO content with AI
  const generateSeoContent = async () => {
    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call an API endpoint
      // For this demo, we'll simulate AI-generated content
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate sample content based on campaign data
      let generatedTitle = '';
      let generatedDescription = '';
      
      if (campaignData?.basics?.projectTitle) {
        generatedTitle = `Fund ${campaignData.basics.projectTitle} | Innovative ${campaignData.basics.category || 'Project'}`;
      }
      
      if (campaignData?.basics?.projectDescription) {
        const plainDesc = campaignData.basics.projectDescription.replace(/<[^>]*>?/gm, '');
        generatedDescription = truncateText(
          `Support our ${campaignData.basics.category || 'project'}: ${plainDesc}`, 
          155
        );
      }
      
      if (generatedTitle) setMetaTitle(generatedTitle);
      if (generatedDescription) setMetaDescription(generatedDescription);
      
      // Also generate social content
      if (generatedTitle) setSocialTitle(generatedTitle);
      if (generatedDescription) {
        setSocialDescription(generatedDescription + ' Join us in making a difference!');
      }
      
    } catch (err) {
      console.error('Error generating SEO content:', err);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Get score color
  const getScoreColor = () => {
    if (seoScore >= 80) return 'success';
    if (seoScore >= 50) return 'warning';
    return 'danger';
  };
  
  // Render SEO score indicator
  const renderSeoScore = () => {
    return (
      <div className="seo-score-container">
        <div className={`seo-score-circle ${getScoreColor()}`}>
          <span className="seo-score-value">{seoScore}</span>
          <span className="seo-score-max">/100</span>
        </div>
        <div className="seo-score-label">
          SEO Score
        </div>
      </div>
    );
  };
  
  // Render search preview
  const renderSearchPreview = () => {
    switch (previewType) {
      case 'google':
        return (
          <div className="search-preview google-preview">
            <div className="preview-title">{metaTitle || 'Your campaign title will appear here'}</div>
            <div className="preview-url">www.yourfundingsite.com/campaign/{campaignData?.basics?.projectTitle?.toLowerCase().replace(/\s+/g, '-') || 'your-campaign'}</div>
            <div className="preview-description">
              {metaDescription || 'Your campaign description will appear here. Make it compelling and informative to attract potential backers.'}
            </div>
          </div>
        );
      
      case 'facebook':
        return (
          <div className="search-preview facebook-preview">
            <div className="fb-image-container">
              <div className="fb-image">
                {campaignData?.basics?.projectImageUrl ? (
                  <img src={campaignData.basics.projectImageUrl} alt="Campaign" />
                ) : (
                  <div className="placeholder-image">Campaign Image</div>
                )}
              </div>
            </div>
            <div className="fb-content">
              <div className="fb-source">yourfundingsite.com</div>
              <div className="fb-title">{socialTitle || 'Your Social Title'}</div>
              <div className="fb-description">
                {socialDescription || 'Your social media description will appear here when your campaign is shared on Facebook.'}
              </div>
            </div>
          </div>
        );
      
      case 'twitter':
        return (
          <div className="search-preview twitter-preview">
            <div className="tw-image-container">
              {campaignData?.basics?.projectImageUrl ? (
                <img src={campaignData.basics.projectImageUrl} alt="Campaign" />
              ) : (
                <div className="placeholder-image">Campaign Image</div>
              )}
            </div>
            <div className="tw-content">
              <div className="tw-title">{socialTitle || 'Your Social Title'}</div>
              <div className="tw-description">
                {truncateText(socialDescription || 'Your campaign description for Twitter...', 125)}
              </div>
              <div className="tw-source">yourfundingsite.com</div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Update keyword density calculation when data changes
  useEffect(() => {
    if (focusKeyword && campaignData?.story?.projectStory) {
      calculateKeywordDensity();
    }
  }, [focusKeyword, campaignData?.story?.projectStory]);
  
  // Calculate keyword density
  const calculateKeywordDensity = () => {
    const keyword = focusKeyword.toLowerCase();
    const content = stripHtml(campaignData?.story?.projectStory).toLowerCase();
    
    if (!keyword || !content) {
      setKeywordDensity(0);
      return;
    }
    
    const keywordRegex = new RegExp(keyword, 'g');
    const wordCount = content.split(/\s+/).length;
    const keywordCount = (content.match(keywordRegex) || []).length;
    
    const density = (keywordCount / wordCount) * 100;
    setKeywordDensity(parseFloat(density.toFixed(2)));
  };
  
  // Strip HTML tags from string
  const stripHtml = (html) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };
  
  // Get keyword density rating
  const getKeywordRating = () => {
    if (keywordDensity === 0) return 'none';
    if (keywordDensity < 0.5) return 'low';
    if (keywordDensity <= 2.5) return 'good';
    return 'high';
  };
  
  // Get the rating color
  const getRatingColor = (rating) => {
    switch (rating) {
      case 'none': return '#6c757d'; // gray
      case 'low': return '#ffc107'; // yellow
      case 'good': return '#28a745'; // green
      case 'high': return '#dc3545'; // red
      default: return '#6c757d';
    }
  };
  
  // Generate title suggestions
  const generateTitleSuggestions = () => {
    if (!campaignData?.basics?.projectTitle || !focusKeyword) return [];
    
    const baseTitle = campaignData.basics.projectTitle;
    const keyword = focusKeyword;
    
    return [
      `${baseTitle} | ${keyword} Funding Campaign`,
      `Support Our ${keyword} Project: ${baseTitle}`,
      `${baseTitle}: Revolutionary ${keyword} Initiative`,
      `Invest in ${keyword}: ${baseTitle} Campaign`,
      `${baseTitle} - Innovative ${keyword} Solution`
    ];
  };
  
  return (
    <Card className="seo-optimizer">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <FontAwesomeIcon icon={faSearch} className="me-2" />
          SEO &amp; Visibility
        </h5>
        <div>
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={generateSeoContent}
            disabled={isGenerating}
          >
            <FontAwesomeIcon icon={faMagic} className="me-1" />
            {isGenerating ? 'Generating...' : 'Auto-Generate'}
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <Tabs
          activeKey={activeTab}
          onSelect={(key) => setActiveTab(key)}
          className="mb-4"
        >
          <Tab eventKey="search" title="Search Optimization">
            <Row className="mb-4">
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Focus Keyword</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Main keyword for your campaign"
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    This is the main term you want your campaign to rank for.
                  </Form.Text>
                </Form.Group>
                
                {focusKeyword && (
                  <div className="keyword-density-meter mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span>Keyword Density</span>
                      <span style={{ color: getRatingColor(getKeywordRating()) }}>
                        {keywordDensity}% ({getKeywordRating()})
                      </span>
                    </div>
                    <div className="progress">
                      <div 
                        className="progress-bar" 
                        role="progressbar" 
                        style={{ 
                          width: `${Math.min(keywordDensity * 20, 100)}%`,
                          backgroundColor: getRatingColor(getKeywordRating())
                        }}
                        aria-valuenow={keywordDensity}
                        aria-valuemin="0"
                        aria-valuemax="5"
                      ></div>
                    </div>
                    <small className="text-muted">
                      Ideal density: 0.5% - 2.5%
                    </small>
                  </div>
                )}
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Meta Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Title for search results (50-60 characters)"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    maxLength={60}
                  />
                  <div className="d-flex justify-content-between">
                    <Form.Text className="text-muted">
                      Appears as the title in search engine results.
                    </Form.Text>
                    <small className={metaTitle?.length > 50 ? 'text-danger' : 'text-muted'}>
                      {metaTitle?.length || 0}/60
                    </small>
                  </div>
                </Form.Group>
                
                {generateTitleSuggestions().length > 0 && (
                  <div className="title-suggestions mb-3">
                    <small className="text-muted d-block mb-2">Suggested titles:</small>
                    <div className="suggestion-tags">
                      {generateTitleSuggestions().map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline-secondary"
                          size="sm"
                          className="me-2 mb-2"
                          onClick={() => setMetaTitle(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Meta Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Description for search results (150-160 characters)"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    maxLength={160}
                  />
                  <div className="d-flex justify-content-between">
                    <Form.Text className="text-muted">
                      Appears as the description in search engine results.
                    </Form.Text>
                    <small className={metaDescription?.length > 150 ? 'text-danger' : 'text-muted'}>
                      {metaDescription?.length || 0}/160
                    </small>
                  </div>
                </Form.Group>
              </Col>
            </Row>
            
            <div className="search-preview">
              <h6 className="preview-title">
                <FontAwesomeIcon icon={faSearch} className="me-2" />
                Search Result Preview
              </h6>
              <div className="search-result">
                <div className="search-title">
                  {metaTitle || campaignData?.basics?.projectTitle || 'Your Campaign Title'}
                </div>
                <div className="search-url">
                  yourplatform.com/campaigns/{campaignData?.basics?.projectTitle
                    ? campaignData.basics.projectTitle.toLowerCase().replace(/\s+/g, '-')
                    : 'your-campaign-name'}
                </div>
                <div className="search-description">
                  {metaDescription || campaignData?.basics?.projectDescription || 'Your campaign description will appear here. Make sure to write a compelling description that encourages users to click through to your campaign page.'}
                </div>
              </div>
            </div>
          </Tab>
          
          <Tab eventKey="social" title="Social Media Preview">
            <Row className="mb-4">
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Social Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Title for social media shares"
                    value={socialTitle}
                    onChange={(e) => setSocialTitle(e.target.value)}
                    maxLength={60}
                  />
                  <div className="d-flex justify-content-between">
                    <Form.Text className="text-muted">
                      Used when your campaign is shared on social media.
                    </Form.Text>
                    <small className="text-muted">
                      {socialTitle?.length || 0}/60
                    </small>
                  </div>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Social Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Description for social media shares"
                    value={socialDescription}
                    onChange={(e) => setSocialDescription(e.target.value)}
                    maxLength={200}
                  />
                  <div className="d-flex justify-content-between">
                    <Form.Text className="text-muted">
                      Used when your campaign is shared on social media.
                    </Form.Text>
                    <small className="text-muted">
                      {socialDescription?.length || 0}/200
                    </small>
                  </div>
                </Form.Group>
              </Col>
            </Row>
            
            <div className="social-preview">
              <h6 className="preview-title">Social Media Preview</h6>
              
              <div className="social-card">
                <div className="social-image">
                  {campaignData?.basics?.projectImageUrl ? (
                    <img src={campaignData.basics.projectImageUrl} alt="Campaign" />
                  ) : (
                    <div className="placeholder-image">
                      <FontAwesomeIcon icon={faInfoCircle} size="2x" />
                      <div>Campaign Image</div>
                    </div>
                  )}
                </div>
                <div className="social-content">
                  <div className="social-domain">yourplatform.com</div>
                  <div className="social-title">
                    {socialTitle || metaTitle || campaignData?.basics?.projectTitle || 'Your Campaign Title'}
                  </div>
                  <div className="social-description">
                    {socialDescription || metaDescription || campaignData?.basics?.projectDescription || 'Your social media description will appear here. Make it engaging to encourage clicks.'}
                  </div>
                </div>
              </div>
            </div>
          </Tab>
        </Tabs>
        
        <Row>
          <Col md={8}>
            <div className="preview-tabs mb-4">
              <div className="preview-tab-buttons">
                <Button 
                  variant={previewType === 'google' ? 'primary' : 'outline-primary'} 
                  size="sm"
                  onClick={() => setPreviewType('google')}
                >
                  Google
                </Button>
                <Button 
                  variant={previewType === 'facebook' ? 'primary' : 'outline-primary'} 
                  size="sm"
                  onClick={() => setPreviewType('facebook')}
                  className="ms-2"
                >
                  Facebook
                </Button>
                <Button 
                  variant={previewType === 'twitter' ? 'primary' : 'outline-primary'} 
                  size="sm"
                  onClick={() => setPreviewType('twitter')}
                  className="ms-2"
                >
                  Twitter
                </Button>
              </div>
              
              <div className="preview-container">
                {renderSearchPreview()}
              </div>
            </div>
            
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Suggested Keywords</Form.Label>
                <div className="suggested-keywords mb-3">
                  <small className="text-muted d-block mb-2">Suggested keywords:</small>
                  {suggestedKeywords.map((keyword, index) => (
                    <Button
                      key={index}
                      variant="outline-secondary"
                      size="sm"
                      className="me-2 mb-2"
                      onClick={() => setFocusKeyword(keyword)}
                    >
                      {keyword}
                    </Button>
                  ))}
                </div>
              </Form.Group>
            </Form>
          </Col>
          
          <Col md={4}>
            <div className="seo-sidebar">
              {renderSeoScore()}
              
              <div className="progress-container mb-4">
                <ProgressBar 
                  variant={getScoreColor()} 
                  now={seoScore} 
                  className="mb-2" 
                />
                <div className="text-center small text-muted">
                  {seoScore < 50 
                    ? 'Needs improvement' 
                    : seoScore < 80 
                      ? 'Good, but can be better' 
                      : 'Excellent!'}
                </div>
              </div>
              
              <Accordion defaultActiveKey="0" className="analysis-accordion">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>
                    <span>SEO Analysis</span>
                  </Accordion.Header>
                  <Accordion.Body>
                    <div className="analysis-results">
                      {analyses.map((analysis, index) => (
                        <div 
                          key={index} 
                          className={`analysis-item ${analysis.type}`}
                        >
                          <div className="analysis-icon">
                            {analysis.type === 'success' && (
                              <FontAwesomeIcon icon={faCheckCircle} />
                            )}
                            {analysis.type === 'warning' && (
                              <FontAwesomeIcon icon={faExclamationTriangle} />
                            )}
                            {analysis.type === 'error' && (
                              <FontAwesomeIcon icon={faTimesCircle} />
                            )}
                          </div>
                          <div className="analysis-message">
                            {analysis.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
                
                <Accordion.Item eventKey="1">
                  <Accordion.Header>
                    <span>SEO Tips</span>
                  </Accordion.Header>
                  <Accordion.Body>
                    <ul className="seo-tips">
                      <li>
                        <FontAwesomeIcon icon={faLightbulb} className="me-2 text-warning" />
                        Include your focus keyword in the title, description, and campaign content.
                      </li>
                      <li>
                        <FontAwesomeIcon icon={faLightbulb} className="me-2 text-warning" />
                        Keep your meta title between 50-60 characters for optimal display in search results.
                      </li>
                      <li>
                        <FontAwesomeIcon icon={faLightbulb} className="me-2 text-warning" />
                        Write a compelling meta description between 120-160 characters to increase click-through rates.
                      </li>
                      <li>
                        <FontAwesomeIcon icon={faLightbulb} className="me-2 text-warning" />
                        Use your campaign's primary goal in the title to attract your target audience.
                      </li>
                      <li>
                        <FontAwesomeIcon icon={faLightbulb} className="me-2 text-warning" />
                        Optimize your social media sharing text to encourage sharing and engagement.
                      </li>
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
              
              <Alert variant="info" className="mt-4">
                <div className="d-flex">
                  <div className="me-3">
                    <FontAwesomeIcon icon={faSearch} size="lg" />
                  </div>
                  <div>
                    <strong>SEO matters!</strong> 
                    <p className="mb-0 small">
                      Campaigns with optimized SEO receive up to 53% more visibility and 23% more funding on average.
                    </p>
                  </div>
                </div>
              </Alert>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default SeoOptimizer; 