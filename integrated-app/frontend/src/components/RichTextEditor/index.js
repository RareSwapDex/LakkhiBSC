import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button, ButtonGroup, Card, Modal, Form, Row, Col, Alert, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCode,
  faExpand,
  faCompress,
  faInfoCircle,
  faImage,
  faVideo,
  faLink,
  faHeading,
  faListUl,
  faListOl,
  faQuoteRight,
  faBold,
  faItalic,
  faUnderline,
  faStrikethrough,
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faAlignJustify,
  faMagic,
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import './styles.css';

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = 'Write your content here...',
  height = '300px',
  aiSuggestions = true
}) => {
  const [editorState, setEditorState] = useState(value || '');
  const [fullScreen, setFullScreen] = useState(false);
  const [showHtmlModal, setShowHtmlModal] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const quillRef = useRef(null);
  const containerRef = useRef(null);
  
  // Sync with parent component's value
  useEffect(() => {
    if (value !== editorState) {
      setEditorState(value || '');
    }
  }, [value]);
  
  // Handle content change
  const handleChange = (content) => {
    setEditorState(content);
    onChange(content);
    
    // Calculate word and character count
    const text = getPlainText(content);
    const words = text.split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(text.length);
  };
  
  // Extract plain text from HTML
  const getPlainText = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };
  
  // Toggle fullscreen mode
  const toggleFullScreen = () => {
    setFullScreen(!fullScreen);
  };
  
  // Handle HTML editing
  const openHtmlModal = () => {
    setHtmlContent(editorState);
    setShowHtmlModal(true);
  };
  
  const saveHtmlContent = () => {
    setEditorState(htmlContent);
    onChange(htmlContent);
    setShowHtmlModal(false);
  };
  
  // Handle media insertion
  const openMediaModal = (type) => {
    setMediaType(type);
    setMediaUrl('');
    setShowMediaModal(true);
  };
  
  const insertMedia = () => {
    if (!mediaUrl.trim()) return;
    
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true);
    
    if (mediaType === 'image') {
      editor.insertEmbed(range.index, 'image', mediaUrl);
    } else if (mediaType === 'video') {
      // Handle YouTube videos
      let videoUrl = mediaUrl;
      
      // Convert YouTube URL to embed format
      if (mediaUrl.includes('youtube.com/watch') || mediaUrl.includes('youtu.be')) {
        const videoId = mediaUrl.includes('youtube.com/watch') 
          ? new URL(mediaUrl).searchParams.get('v')
          : mediaUrl.split('/').pop().split('?')[0];
          
        if (videoId) {
          videoUrl = `https://www.youtube.com/embed/${videoId}`;
        }
      }
      
      // Insert an iframe for the video
      editor.insertEmbed(range.index, 'video', videoUrl);
    }
    
    editor.setSelection(range.index + 1);
    setShowMediaModal(false);
  };
  
  // AI content suggestions
  const openAiModal = () => {
    setAiPrompt('');
    setAiError(null);
    setShowAiModal(true);
  };
  
  const generateAiSuggestions = async () => {
    if (!aiPrompt.trim()) {
      setAiError('Please enter a prompt for content suggestions');
      return;
    }
    
    setAiLoading(true);
    setAiError(null);
    
    try {
      // In a real implementation, this would call an API endpoint
      // For this demo, we'll simulate AI responses
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockSuggestions = [
        generateMockSuggestion(aiPrompt, 'professional'),
        generateMockSuggestion(aiPrompt, 'friendly'),
        generateMockSuggestion(aiPrompt, 'persuasive')
      ];
      
      setSuggestions(mockSuggestions);
    } catch (err) {
      console.error('Error generating AI suggestions:', err);
      setAiError('Failed to generate suggestions. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };
  
  // Mock AI suggestion generation (would be replaced with actual API calls)
  const generateMockSuggestion = (prompt, style) => {
    const baseText = prompt.toLowerCase();
    let result = '';
    
    switch (style) {
      case 'professional':
        result = `<p><strong>Professional Analysis:</strong> ${baseText} represents a significant opportunity in the current market. Our project addresses this by implementing innovative solutions that are both scalable and sustainable. With a focused approach, we can deliver measurable results that exceed stakeholder expectations.</p>`;
        break;
      case 'friendly':
        result = `<p><strong>Let's Talk About This:</strong> Hey there! So you're interested in ${baseText}? That's awesome! We're super excited about this project too, and we'd love to share why it matters so much to us. We've put our hearts into creating something that we think you'll really connect with.</p>`;
        break;
      case 'persuasive':
        result = `<p><strong>Why This Matters:</strong> Imagine what ${baseText} could mean for your future. This isn't just another project—it's a game-changer that addresses real problems with practical solutions. By supporting us, you're not just backing a concept, you're investing in a vision that will transform how we think about this space.</p>`;
        break;
      default:
        result = `<p>Content about ${baseText}</p>`;
    }
    
    return {
      id: Math.random().toString(36).substring(2),
      style,
      content: result
    };
  };
  
  // Insert AI suggestion into editor
  const insertSuggestion = (content) => {
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true);
    
    editor.clipboard.dangerouslyPasteHTML(range.index, content);
    editor.setSelection(range.index + 1);
    
    setShowAiModal(false);
  };
  
  // AI suggestion handlers (mock implementation)
  const generateAISuggestion = async (type) => {
    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call an AI service
      const quill = quillRef.current.getEditor();
      const selection = quill.getSelection();
      
      // Simulated AI generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Example suggestions based on type
      let suggestion = '';
      
      switch (type) {
        case 'improve':
          suggestion = 'This text has been enhanced to be more engaging and persuasive. It maintains the core message while using clearer language and better structure.';
          break;
        case 'expand':
          suggestion = 'This expanded text provides more detail and context to help readers better understand the subject. It includes additional relevant information without unnecessary filler.';
          break;
        case 'shorten':
          suggestion = 'Key points preserved in a concise format.';
          break;
        default:
          suggestion = 'AI-suggested content would appear here.';
      }
      
      // Insert the suggested text
      if (selection) {
        quill.insertText(selection.index, suggestion);
      } else {
        quill.insertText(quill.getLength() - 1, suggestion);
      }
      
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const modules = {
    toolbar: {
      container: '#toolbar',
    },
    clipboard: {
      matchVisual: false, // Prevents unwanted formatting
    }
  };
  
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background',
    'align',
    'blockquote', 'code-block',
  ];
  
  return (
    <div 
      ref={containerRef} 
      className={`rich-text-editor ${fullScreen ? 'fullscreen' : ''}`}
      style={{ height: fullScreen ? '100%' : 'auto' }}
    >
      <Card className="editor-card">
        <Card.Header className="editor-toolbar">
          <div id="toolbar">
            <ButtonGroup className="me-2 mb-2">
              <Button variant="outline-secondary" title="Heading">
                <FontAwesomeIcon icon={faHeading} />
              </Button>
              <Button variant="outline-secondary" title="Bold">
                <FontAwesomeIcon icon={faBold} />
              </Button>
              <Button variant="outline-secondary" title="Italic">
                <FontAwesomeIcon icon={faItalic} />
              </Button>
              <Button variant="outline-secondary" title="Underline">
                <FontAwesomeIcon icon={faUnderline} />
              </Button>
              <Button variant="outline-secondary" title="Strikethrough">
                <FontAwesomeIcon icon={faStrikethrough} />
              </Button>
            </ButtonGroup>
            
            <ButtonGroup className="me-2 mb-2">
              <Button variant="outline-secondary" title="Bulleted List">
                <FontAwesomeIcon icon={faListUl} />
              </Button>
              <Button variant="outline-secondary" title="Numbered List">
                <FontAwesomeIcon icon={faListOl} />
              </Button>
              <Button variant="outline-secondary" title="Blockquote">
                <FontAwesomeIcon icon={faQuoteRight} />
              </Button>
            </ButtonGroup>
            
            <ButtonGroup className="me-2 mb-2">
              <Button variant="outline-secondary" title="Align Left">
                <FontAwesomeIcon icon={faAlignLeft} />
              </Button>
              <Button variant="outline-secondary" title="Align Center">
                <FontAwesomeIcon icon={faAlignCenter} />
              </Button>
              <Button variant="outline-secondary" title="Align Right">
                <FontAwesomeIcon icon={faAlignRight} />
              </Button>
              <Button variant="outline-secondary" title="Justify">
                <FontAwesomeIcon icon={faAlignJustify} />
              </Button>
            </ButtonGroup>
            
            <ButtonGroup className="me-2 mb-2">
              <Button 
                variant="outline-secondary" 
                title="Insert Image" 
                onClick={() => openMediaModal('image')}
              >
                <FontAwesomeIcon icon={faImage} />
              </Button>
              <Button 
                variant="outline-secondary" 
                title="Insert Video" 
                onClick={() => openMediaModal('video')}
              >
                <FontAwesomeIcon icon={faVideo} />
              </Button>
              <Button variant="outline-secondary" title="Insert Link">
                <FontAwesomeIcon icon={faLink} />
              </Button>
            </ButtonGroup>
            
            <ButtonGroup className="mb-2">
              <Button 
                variant="outline-secondary" 
                title="Edit HTML" 
                onClick={openHtmlModal}
              >
                <FontAwesomeIcon icon={faCode} />
              </Button>
              {aiSuggestions && (
                <Button 
                  variant="outline-primary" 
                  title="AI Content Suggestions" 
                  onClick={openAiModal}
                >
                  <FontAwesomeIcon icon={faMagic} />
                </Button>
              )}
              <Button 
                variant="outline-secondary" 
                title={fullScreen ? 'Exit Fullscreen' : 'Fullscreen'} 
                onClick={toggleFullScreen}
              >
                <FontAwesomeIcon icon={fullScreen ? faCompress : faExpand} />
              </Button>
            </ButtonGroup>
          </div>
        </Card.Header>
        
        <Card.Body className="editor-body" style={{ height }}>
          {aiSuggestions && (
            <div className="ai-suggestion-toolbar mb-2">
              <div className="d-flex align-items-center">
                <span className="me-2 text-muted">
                  <FontAwesomeIcon icon={faMagic} className="me-1" /> AI Assist:
                </span>
                <ButtonGroup size="sm">
                  <Button 
                    variant="outline-primary" 
                    onClick={() => generateAISuggestion('improve')}
                    disabled={isGenerating}
                  >
                    Improve
                  </Button>
                  <Button 
                    variant="outline-primary" 
                    onClick={() => generateAISuggestion('expand')}
                    disabled={isGenerating}
                  >
                    Expand
                  </Button>
                  <Button 
                    variant="outline-primary" 
                    onClick={() => generateAISuggestion('shorten')}
                    disabled={isGenerating}
                  >
                    Shorten
                  </Button>
                </ButtonGroup>
                
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip>
                      Select text and click an AI option to get suggestions. 
                      This will help improve your campaign description.
                    </Tooltip>
                  }
                >
                  <Button variant="link" className="text-muted p-0 ms-2">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                  </Button>
                </OverlayTrigger>
              </div>
            </div>
          )}
          
          <ReactQuill
            ref={quillRef}
            value={editorState}
            onChange={handleChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
            theme="snow"
            className="quill-editor"
            style={{ height: aiSuggestions ? 'calc(100% - 40px)' : '100%' }}
          />
        </Card.Body>
        
        <Card.Footer className="editor-footer d-flex justify-content-between align-items-center">
          <div className="text-muted">
            {wordCount} words | {charCount} characters
          </div>
          <div className="editor-tips">
            <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
            <small>Tip: Use Ctrl+B for bold, Ctrl+I for italic</small>
          </div>
        </Card.Footer>
      </Card>
      
      {/* HTML Editor Modal */}
      <Modal show={showHtmlModal} onHide={() => setShowHtmlModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit HTML</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            as="textarea"
            rows={12}
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            style={{ fontFamily: 'monospace' }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHtmlModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveHtmlContent}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Media Modal */}
      <Modal show={showMediaModal} onHide={() => setShowMediaModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Insert {mediaType === 'image' ? 'Image' : 'Video'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              {mediaType === 'image' ? 'Image URL' : 'Video URL'}
            </Form.Label>
            <Form.Control
              type="url"
              placeholder={
                mediaType === 'image'
                  ? 'https://example.com/image.jpg'
                  : 'https://youtube.com/watch?v=...'
              }
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
            />
            {mediaType === 'video' && (
              <Form.Text className="text-muted">
                Supports YouTube, Vimeo, and direct video URLs
              </Form.Text>
            )}
          </Form.Group>
          
          {mediaUrl && mediaType === 'image' && (
            <div className="media-preview">
              <img 
                src={mediaUrl} 
                alt="Preview" 
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x150?text=Invalid+Image+URL';
                }} 
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMediaModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={insertMedia}>
            Insert
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* AI Suggestions Modal */}
      {aiSuggestions && (
        <Modal 
          show={showAiModal} 
          onHide={() => setShowAiModal(false)} 
          size="lg"
          className="ai-suggestions-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FontAwesomeIcon icon={faMagic} className="me-2" />
              AI Content Suggestions
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>What would you like to write about?</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="E.g., Describe the benefits of our community garden project"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
            </Form.Group>
            
            <div className="d-grid mb-4">
              <Button 
                variant="primary" 
                onClick={generateAiSuggestions}
                disabled={aiLoading || !aiPrompt.trim()}
              >
                {aiLoading ? 'Generating Ideas...' : 'Generate Ideas'}
              </Button>
            </div>
            
            {aiError && (
              <Alert variant="danger">{aiError}</Alert>
            )}
            
            {suggestions.length > 0 && (
              <div className="suggestions-container">
                <h5>Suggestions</h5>
                <p className="text-muted mb-3">Click on a suggestion to insert it into your editor</p>
                
                <Row>
                  {suggestions.map((suggestion) => (
                    <Col md={12} key={suggestion.id} className="mb-3">
                      <Card 
                        className="suggestion-card"
                        onClick={() => insertSuggestion(suggestion.content)}
                      >
                        <Card.Header>
                          <Badge bg="info">{suggestion.style}</Badge>
                        </Card.Header>
                        <Card.Body>
                          <div dangerouslySetInnerHTML={{ __html: suggestion.content }} />
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAiModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default RichTextEditor; 