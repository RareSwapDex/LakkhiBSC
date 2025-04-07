import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Card, Button, Form, Row, Col, Tabs, Tab, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faImage, faVideo, faLink, faTable, faEye } from '@fortawesome/free-solid-svg-icons';
import './styles.css';

// Custom image upload handler
function imageHandler() {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.click();

  input.onchange = () => {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const range = this.quill.getSelection(true);
        this.quill.insertEmbed(range.index, 'image', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
}

// Custom video embed handler
function videoHandler() {
  const url = prompt('Enter the video URL (YouTube, Vimeo, etc.)');
  if (url) {
    // Handle YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtube.com')) {
        videoId = url.split('v=')[1];
        if (videoId.includes('&')) {
          videoId = videoId.split('&')[0];
        }
      } else if (url.includes('youtu.be')) {
        videoId = url.split('/').pop();
      }
      
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      const range = this.quill.getSelection(true);
      this.quill.insertEmbed(range.index, 'video', embedUrl);
    } 
    // Handle Vimeo URLs
    else if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      const embedUrl = `https://player.vimeo.com/video/${videoId}`;
      const range = this.quill.getSelection(true);
      this.quill.insertEmbed(range.index, 'video', embedUrl);
    } 
    // For other URLs, just use as is
    else {
      const range = this.quill.getSelection(true);
      this.quill.insertEmbed(range.index, 'video', url);
    }
  }
}

// Define formats to be enabled
const formats = [
  'header', 'font', 'size', 'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent', 'link', 'image', 'video', 'code-block', 'color', 'background',
  'align', 'script', 'table'
];

// Define modules configuration
const getModules = (quillRef) => ({
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['code-block'],
      ['clean']
    ],
    handlers: {
      image: quillRef ? imageHandler.bind(quillRef) : undefined,
      video: quillRef ? videoHandler.bind(quillRef) : undefined
    }
  },
  clipboard: {
    matchVisual: false
  }
});

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = 'Write something amazing...',
  minHeight = '200px',
  className = '',
  label = '',
  helpText = '',
  required = false
}) => {
  const [editorValue, setEditorValue] = useState(value || '');
  const [showPreview, setShowPreview] = useState(false);
  const [showHtmlModal, setShowHtmlModal] = useState(false);
  const [htmlSource, setHtmlSource] = useState('');
  const [activeTab, setActiveTab] = useState('visual');
  const quillRef = useRef(null);

  // Sync state with parent component
  useEffect(() => {
    setEditorValue(value || '');
  }, [value]);

  const handleChange = (content) => {
    setEditorValue(content);
    if (onChange) {
      onChange(content);
    }
  };

  const handleHtmlEdit = () => {
    // Get current content as HTML
    setHtmlSource(editorValue);
    setShowHtmlModal(true);
  };

  const saveHtmlChanges = () => {
    // Update editor content with modified HTML
    handleChange(htmlSource);
    setShowHtmlModal(false);
  };

  return (
    <div className={`rich-text-editor ${className}`}>
      {label && (
        <Form.Label>
          {label}
          {required && <span className="text-danger">*</span>}
        </Form.Label>
      )}

      <Card className="editor-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <Tabs 
            activeKey={activeTab} 
            onSelect={(k) => setActiveTab(k)}
            className="editor-tabs"
          >
            <Tab eventKey="visual" title="Visual Editor" />
            <Tab eventKey="html" title="HTML" onEnter={handleHtmlEdit} />
          </Tabs>
          
          <div className="editor-actions">
            <Button 
              variant="light" 
              size="sm" 
              onClick={() => setShowPreview(!showPreview)}
              className="me-2"
              title="Preview"
            >
              <FontAwesomeIcon icon={faEye} /> {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </div>
        </Card.Header>
        
        <Card.Body>
          <div className={showPreview ? 'd-none' : ''}>
            {activeTab === 'visual' && (
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={editorValue}
                onChange={handleChange}
                modules={getModules(quillRef.current)}
                formats={formats}
                placeholder={placeholder}
                style={{ minHeight }}
              />
            )}
            
            {activeTab === 'html' && (
              <Form.Control
                as="textarea"
                value={htmlSource}
                onChange={(e) => setHtmlSource(e.target.value)}
                style={{ 
                  minHeight: `calc(${minHeight} + 100px)`, 
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                }}
              />
            )}
          </div>
          
          {showPreview && (
            <div className="content-preview p-3 border rounded">
              <div 
                dangerouslySetInnerHTML={{ __html: editorValue }} 
                className="preview-content"
              />
            </div>
          )}
          
          {helpText && (
            <Form.Text className="text-muted mt-2">
              {helpText}
            </Form.Text>
          )}
        </Card.Body>
      </Card>
      
      {/* HTML Edit Modal */}
      <Modal show={showHtmlModal} onHide={() => setShowHtmlModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit HTML Source</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            as="textarea"
            value={htmlSource}
            onChange={(e) => setHtmlSource(e.target.value)}
            style={{ 
              height: '400px', 
              fontFamily: 'monospace',
              fontSize: '0.9rem'
            }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHtmlModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveHtmlChanges}>
            Apply Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RichTextEditor; 