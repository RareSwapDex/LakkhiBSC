import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Form, Spinner, Row, Col, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faImage, faLink, faTrashAlt, faEdit, faSort, faCloudDownloadAlt, faClipboard } from '@fortawesome/free-solid-svg-icons';
import Cropper from 'react-easy-crop';
import './styles.css';

const ImageUploader = ({ 
  onChange, 
  maxFiles = 5,
  maxFileSize = 5, // in MB
  acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  initialImages = []
}) => {
  const [images, setImages] = useState(initialImages || []);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  
  const fileInputRef = useRef(null);
  const dropzoneRef = useRef(null);
  
  useEffect(() => {
    // Notify parent component of image changes
    if (onChange) {
      onChange(images);
    }
  }, [images, onChange]);
  
  // Set up clipboard paste event listener
  useEffect(() => {
    const handlePaste = (e) => {
      // Only process if we're focusing on our component
      if (document.activeElement === dropzoneRef.current || 
          dropzoneRef.current.contains(document.activeElement)) {
        if (e.clipboardData && e.clipboardData.items) {
          const items = e.clipboardData.items;
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
              const file = items[i].getAsFile();
              handleFileUpload([file]);
              e.preventDefault();
              break;
            }
          }
        }
      }
    };
    
    document.addEventListener('paste', handlePaste);
    
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);
  
  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    handleFileUpload(files);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  // Process files for upload
  const handleFileUpload = async (files) => {
    if (images.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed.`);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const processedFiles = [];
      
      for (const file of files) {
        // Filter by accepted formats
        if (!acceptedFormats.includes(file.type)) {
          setError(`File type ${file.type} not supported. Accepted formats: ${acceptedFormats.join(', ')}`);
          continue;
        }
        
        // Check file size
        if (file.size > maxFileSize * 1024 * 1024) {
          setError(`File exceeds the maximum size of ${maxFileSize}MB.`);
          continue;
        }
        
        // Create preview URL
        const preview = URL.createObjectURL(file);
        
        processedFiles.push({
          file,
          preview,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadProgress: 100, // For demo purposes, would be updated during actual upload
          status: 'ready'
        });
      }
      
      if (processedFiles.length > 0) {
        setImages(prev => [...prev, ...processedFiles]);
      }
    } catch (err) {
      setError(`Error processing files: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle URL image import
  const handleUrlImport = async () => {
    if (!urlInput) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Check if URL is valid
      const url = new URL(urlInput);
      
      // Attempt to fetch the image to verify it exists and is an image
      const response = await fetch(urlInput, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.startsWith('image/')) {
        setError('URL does not point to a valid image');
        setLoading(false);
        return;
      }
      
      // Convert the URL image to a blob/file object
      const imgResponse = await fetch(urlInput);
      const blob = await imgResponse.blob();
      
      // Create a File object from the blob
      const fileName = url.pathname.split('/').pop() || 'image';
      const file = new File([blob], fileName, { type: contentType });
      
      // Process the file as a local upload
      handleFileUpload([file]);
      
      // Clear URL input field
      setUrlInput('');
      setShowUrlInput(false);
      
    } catch (err) {
      setError(`Error importing image from URL: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      handleFileUpload(droppedFiles);
    }
  };
  
  // Handle removing an image
  const handleRemoveImage = (index) => {
    const newImages = [...images];
    
    // Revoke ObjectURL to prevent memory leaks
    if (newImages[index]?.preview) {
      URL.revokeObjectURL(newImages[index].preview);
    }
    
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  // Handle editing an image
  const handleEditImage = (index) => {
    setEditingIndex(index);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };
  
  // Save edited image
  const handleSaveEdit = async () => {
    try {
      if (editingIndex === null || !croppedAreaPixels) return;
      
      const editedImage = await getCroppedImg(
        images[editingIndex].preview,
        croppedAreaPixels,
        rotation
      );
      
      // Convert to file object
      const originalFileName = images[editingIndex].name;
      const fileExtension = originalFileName.split('.').pop();
      
      fetch(editedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], originalFileName, { type: `image/${fileExtension}` });
          
          const updatedImages = [...images];
          updatedImages[editingIndex] = {
            ...updatedImages[editingIndex],
            file,
            preview: editedImage,
          };
          
          setImages(updatedImages);
          setEditingIndex(null);
        });
    } catch (e) {
      setError(`Error saving edited image: ${e.message}`);
    }
  };
  
  // Handle crop complete
  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };
  
  // Create cropped image
  const getCroppedImg = (imageSrc, pixelCrop, rotation) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set dimensions
        const maxSize = Math.max(image.width, image.height);
        canvas.width = maxSize;
        canvas.height = maxSize;
        
        // Draw image to canvas with rotation
        ctx.translate(maxSize / 2, maxSize / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-maxSize / 2, -maxSize / 2);
        
        ctx.drawImage(
          image,
          maxSize / 2 - image.width / 2,
          maxSize / 2 - image.height / 2
        );
        
        // Create new canvas for cropping
        const cropCanvas = document.createElement('canvas');
        const cropCtx = cropCanvas.getContext('2d');
        
        // Set dimensions
        cropCanvas.width = pixelCrop.width;
        cropCanvas.height = pixelCrop.height;
        
        // Draw cropped image
        cropCtx.drawImage(
          canvas,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );
        
        // Get data URL
        resolve(cropCanvas.toDataURL('image/jpeg', 0.8));
      };
      
      image.onerror = (e) => {
        reject(e);
      };
    });
  };
  
  // Reorder images
  const moveImage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    
    const newImages = [...images];
    const [movedItem] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedItem);
    
    setImages(newImages);
  };
  
  return (
    <div className="image-uploader">
      {/* Main upload area */}
      {editingIndex === null ? (
        <div 
          ref={dropzoneRef}
          className={`dropzone ${isDragging ? 'dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          tabIndex="0"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept={acceptedFormats.join(',')}
            multiple={maxFiles > 1}
            className="hidden-input"
          />
          
          <div className="upload-icon-container">
            <FontAwesomeIcon icon={faCloudUploadAlt} size="3x" className="upload-icon" />
            <h4>Drag & Drop Images Here</h4>
            <p>or click to browse files</p>
            
            <p className="text-muted small">
              Max {maxFiles} images, {maxFileSize}MB each. Formats: {acceptedFormats.join(', ').replace(/image\//g, '')}
            </p>
            
            <div className="pt-3">
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="mx-1"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current && fileInputRef.current.click();
                }}
              >
                <FontAwesomeIcon icon={faImage} className="me-1" /> Select Files
              </Button>
              
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="mx-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUrlInput(true);
                }}
              >
                <FontAwesomeIcon icon={faLink} className="me-1" /> Import URL
              </Button>
              
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="mx-1"
                onClick={(e) => {
                  e.stopPropagation();
                  alert('Paste an image from your clipboard into this area');
                }}
                title="Paste from clipboard (Ctrl+V)"
              >
                <FontAwesomeIcon icon={faClipboard} className="me-1" /> Paste
              </Button>
              
              <Dropdown className="d-inline-block mx-1">
                <Dropdown.Toggle variant="outline-secondary" size="sm" id="cloud-import">
                  <FontAwesomeIcon icon={faCloudDownloadAlt} className="me-1" /> Cloud Import
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={(e) => {
                    e.stopPropagation();
                    alert('Google Drive integration would open here');
                  }}>
                    Google Drive
                  </Dropdown.Item>
                  <Dropdown.Item onClick={(e) => {
                    e.stopPropagation();
                    alert('Dropbox integration would open here');
                  }}>
                    Dropbox
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
          
          {/* URL input form */}
          {showUrlInput && (
            <div className="url-input-container" onClick={e => e.stopPropagation()}>
              <Form.Group className="mb-2">
                <Form.Control
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button 
                  variant="light" 
                  size="sm" 
                  className="me-2"
                  onClick={() => setShowUrlInput(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={handleUrlImport}
                  disabled={!urlInput || loading}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : 'Import'}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Image editor */
        <div className="image-editor">
          <Card>
            <Card.Body>
              <div className="crop-container">
                <Cropper
                  image={images[editingIndex]?.preview}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={16 / 9}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              
              <Row className="mt-3">
                <Col>
                  <Form.Group>
                    <Form.Label>Zoom</Form.Label>
                    <Form.Range
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Label>Rotation</Form.Label>
                    <Form.Range
                      value={rotation}
                      min={0}
                      max={360}
                      step={1}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-end mt-3">
                <Button 
                  variant="light" 
                  className="me-2"
                  onClick={() => setEditingIndex(null)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="success"
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
      
      {/* Error display */}
      {error && (
        <div className="text-danger mt-2">
          <small>{error}</small>
        </div>
      )}
      
      {/* Images gallery */}
      {images.length > 0 && editingIndex === null && (
        <div className="image-gallery mt-3">
          <h5>Gallery {images.length > 1 && <small className="text-muted">(Drag to reorder)</small>}</h5>
          <Row xs={1} sm={2} md={3} lg={4} className="g-3">
            {images.map((image, index) => (
              <Col key={index}>
                <Card className="gallery-item">
                  <div className="gallery-img-container">
                    <img src={image.preview} alt={image.name} className="gallery-img" />
                    <div className="gallery-overlay">
                      <Button 
                        variant="light" 
                        size="sm" 
                        className="gallery-action-btn"
                        onClick={() => handleEditImage(index)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        className="gallery-action-btn"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </Button>
                    </div>
                  </div>
                  
                  {images.length > 1 && (
                    <div className="reorder-btns">
                      <Button 
                        variant="light" 
                        size="sm"
                        disabled={index === 0}
                        onClick={() => moveImage(index, index - 1)}
                        className="reorder-btn"
                      >
                        ↑
                      </Button>
                      <Button 
                        variant="light" 
                        size="sm"
                        disabled={index === images.length - 1}
                        onClick={() => moveImage(index, index + 1)}
                        className="reorder-btn"
                      >
                        ↓
                      </Button>
                    </div>
                  )}
                  
                  <Card.Footer className="p-1 text-center">
                    <small className="text-muted">{image.name.substring(0, 20)}{image.name.length > 20 ? '...' : ''}</small>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 