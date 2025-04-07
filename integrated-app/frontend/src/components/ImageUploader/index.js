import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, Button, Form, InputGroup, Alert, Spinner, Image } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faLink, faClipboard, faCloudUploadAlt, faTimes, faEdit, faImage } from '@fortawesome/free-solid-svg-icons';
import './styles.css';

const ImageUploader = ({ value, onChange, maxSize = 5242880 }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [previewUrl, setPreviewUrl] = useState(value || '');
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const fileInputRef = useRef(null);

  // Set initial preview if value exists
  useEffect(() => {
    if (value && value !== previewUrl) {
      setPreviewUrl(value);
    }
  }, [value]);

  // Handle file drop
  const onDrop = useCallback(acceptedFiles => {
    setError(null);
    
    if (acceptedFiles.length === 0) {
      return;
    }
    
    const file = acceptedFiles[0];
    
    if (file.size > maxSize) {
      setError(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB.`);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setPreviewUrl(dataUrl);
      
      // Pass data to parent component
      onChange({ 
        file: file,
        preview: dataUrl,
        type: 'file',
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  }, [maxSize, onChange]);
  
  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });
  
  // Handle URL input
  const handleUrlSubmit = async () => {
    if (!urlInput) return;
    
    setError(null);
    setLoading(true);
    
    try {
      // Check if URL is valid
      const url = new URL(urlInput);
      
      // Create an image to test loading
      const img = new Image();
      
      // Create a promise to handle image loading
      const loadPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Could not load image from URL'));
      });
      
      img.src = urlInput;
      
      try {
        await loadPromise;
        setPreviewUrl(urlInput);
        
        // Pass data to parent component
        onChange({ 
          preview: urlInput,
          type: 'url',
          name: url.pathname.split('/').pop() || 'image-from-url'
        });
      } catch (error) {
        setError('Invalid image URL. Please provide a direct link to an image file.');
      }
    } catch (error) {
      setError('Please enter a valid URL');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle paste from clipboard
  const handlePaste = useCallback(async () => {
    setError(null);
    setLoading(true);
    
    try {
      const items = await navigator.clipboard.read();
      
      for (let item of items) {
        // Check if clipboard contains an image
        const imageTypes = item.types.filter(type => type.startsWith('image/'));
        if (imageTypes.length > 0) {
          const blob = await item.getType(imageTypes[0]);
          const reader = new FileReader();
          
          reader.onload = () => {
            const dataUrl = reader.result;
            setPreviewUrl(dataUrl);
            
            // Pass data to parent component
            onChange({ 
              file: new File([blob], 'clipboard-image.png', { type: blob.type }),
              preview: dataUrl,
              type: 'clipboard',
              name: 'clipboard-image.png'
            });
            
            setLoading(false);
          };
          
          reader.readAsDataURL(blob);
          return;
        }
      }
      
      setError('No image found in clipboard');
    } catch (error) {
      setError('Failed to read from clipboard. Try copying an image first.');
    } finally {
      setLoading(false);
    }
  }, [onChange]);
  
  // Handle cloud upload (mock implementation)
  const handleCloudUpload = () => {
    setError(null);
    
    // In a real implementation, you would integrate with cloud storage providers
    // For this example, we'll just open the file browser
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle remove image
  const handleRemove = () => {
    setPreviewUrl('');
    setUrlInput('');
    onChange(null);
  };
  
  // Render image preview if we have one
  const renderPreview = () => {
    if (!previewUrl) return null;
    
    return (
      <div className="image-preview-container">
        <Image src={previewUrl} alt="Preview" fluid className="image-preview" />
        <div className="image-preview-controls">
          <Button variant="danger" size="sm" onClick={handleRemove} title="Remove">
            <FontAwesomeIcon icon={faTimes} />
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowEditor(true)} title="Edit">
            <FontAwesomeIcon icon={faEdit} />
          </Button>
        </div>
      </div>
    );
  };
  
  // Render editor modal (placeholder)
  const renderEditor = () => {
    if (!showEditor || !previewUrl) return null;
    
    // In a production app, you would integrate a proper image editor here
    return (
      <Card className="image-editor">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Edit Image</h5>
          <Button variant="link" className="p-0" onClick={() => setShowEditor(false)}>
            <FontAwesomeIcon icon={faTimes} />
          </Button>
        </Card.Header>
        <Card.Body>
          <p className="text-center text-muted">Basic editing functionality would be implemented here</p>
          <div className="text-center mb-3">
            <Image src={previewUrl} alt="Edit Preview" style={{ maxHeight: '200px' }} />
          </div>
          <div className="d-flex justify-content-between">
            <Button variant="secondary" onClick={() => setShowEditor(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setShowEditor(false)}>Apply Changes</Button>
          </div>
        </Card.Body>
      </Card>
    );
  };
  
  // If we have a preview, show that instead of the uploader interface
  if (previewUrl) {
    return (
      <div className="image-uploader">
        {renderPreview()}
        {renderEditor()}
      </div>
    );
  }
  
  return (
    <div className="image-uploader">
      <Card>
        <Card.Header>
          <nav className="nav nav-tabs card-header-tabs">
            <a 
              className={`nav-link ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
              href="#"
              role="button"
            >
              <FontAwesomeIcon icon={faUpload} className="me-2" />
              Upload
            </a>
            <a 
              className={`nav-link ${activeTab === 'url' ? 'active' : ''}`}
              onClick={() => setActiveTab('url')}
              href="#"
              role="button"
            >
              <FontAwesomeIcon icon={faLink} className="me-2" />
              URL
            </a>
            <a 
              className={`nav-link ${activeTab === 'clipboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('clipboard')}
              href="#"
              role="button"
            >
              <FontAwesomeIcon icon={faClipboard} className="me-2" />
              Clipboard
            </a>
            <a 
              className={`nav-link ${activeTab === 'cloud' ? 'active' : ''}`}
              onClick={() => setActiveTab('cloud')}
              href="#"
              role="button"
            >
              <FontAwesomeIcon icon={faCloudUploadAlt} className="me-2" />
              Cloud
            </a>
          </nav>
        </Card.Header>
        
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {activeTab === 'upload' && (
            <div 
              {...getRootProps()} 
              className={`dropzone ${isDragActive ? 'active' : ''}`}
            >
              <input {...getInputProps()} />
              <div className="text-center py-4">
                <FontAwesomeIcon icon={faImage} size="3x" className="mb-3 text-muted" />
                {isDragActive ? (
                  <p>Drop the image here...</p>
                ) : (
                  <p>Drag & drop an image here, or click to select</p>
                )}
                <p className="text-muted small">
                  Supported formats: JPG, PNG, GIF, WebP. Max size: {maxSize / 1024 / 1024}MB
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'url' && (
            <div>
              <InputGroup className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Enter image URL"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={loading}
                />
                <Button 
                  variant="primary" 
                  onClick={handleUrlSubmit}
                  disabled={!urlInput || loading}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : 'Add'}
                </Button>
              </InputGroup>
              <p className="text-muted small">
                Enter a direct link to an image file (must end with .jpg, .png, etc.)
              </p>
            </div>
          )}
          
          {activeTab === 'clipboard' && (
            <div className="text-center py-4">
              <FontAwesomeIcon icon={faClipboard} size="3x" className="mb-3 text-muted" />
              <p>Paste an image from your clipboard</p>
              <Button 
                variant="primary" 
                onClick={handlePaste}
                disabled={loading}
              >
                {loading ? <Spinner animation="border" size="sm" /> : 'Paste from Clipboard'}
              </Button>
              <p className="text-muted small mt-2">
                Copy an image to your clipboard first, then click the button above
              </p>
            </div>
          )}
          
          {activeTab === 'cloud' && (
            <div className="text-center py-4">
              <FontAwesomeIcon icon={faCloudUploadAlt} size="3x" className="mb-3 text-muted" />
              <p>Select from cloud storage</p>
              <input
                type="file"
                className="d-none"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    onDrop([e.target.files[0]]);
                  }
                }}
              />
              <Button 
                variant="primary" 
                onClick={handleCloudUpload}
                disabled={loading}
              >
                {loading ? <Spinner animation="border" size="sm" /> : 'Choose from Cloud'}
              </Button>
              <p className="text-muted small mt-2">
                Select an image from Google Drive, Dropbox, or other services
              </p>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {renderEditor()}
    </div>
  );
};

export default ImageUploader; 