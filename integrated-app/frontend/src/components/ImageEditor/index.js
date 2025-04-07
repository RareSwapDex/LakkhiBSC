import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Row, Col, Form, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCrop,
  faUndo,
  faRedo,
  faSave,
  faRotateLeft,
  faRotateRight,
  faExpandArrowsAlt,
  faCompress,
  faAdjust,
  faUnderline
} from '@fortawesome/free-solid-svg-icons';
import './styles.css';

const ImageEditor = ({ show, onHide, image, onSave, aspectRatio = 16/9 }) => {
  const [editedImage, setEditedImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState('crop');
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 });
  const [cropEnd, setCropEnd] = useState({ x: 0, y: 0 });
  const [isCropping, setIsCropping] = useState(false);
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  
  // Initialize image for editing
  useEffect(() => {
    if (show && image) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        drawInitialImage();
      };
      img.onerror = () => {
        setError('Failed to load image for editing');
      };
      img.src = image.preview;
      
      // Reset editing state when opening
      setRotation(0);
      setZoom(1);
      setBrightness(100);
      setContrast(100);
      setFlipHorizontal(false);
      setFlipVertical(false);
      setEditMode('crop');
    }
  }, [show, image]);
  
  // Draw initial image on canvas
  const drawInitialImage = () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const img = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Calculate canvas dimensions while maintaining aspect ratio
    const containerWidth = canvas.parentElement.offsetWidth;
    const containerHeight = containerWidth / aspectRatio;
    
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    // Calculate scaling to fit image
    let scale = Math.min(
      canvas.width / img.width,
      canvas.height / img.height
    );
    
    // Apply zoom
    scale *= zoom;
    
    // Calculate center position
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context state
    ctx.save();
    
    // Translate to center point for rotation and scaling
    ctx.translate(centerX, centerY);
    
    // Apply rotation
    ctx.rotate(rotation * Math.PI / 180);
    
    // Apply flips
    ctx.scale(
      flipHorizontal ? -1 : 1,
      flipVertical ? -1 : 1
    );
    
    // Apply brightness/contrast using composite operations
    if (brightness !== 100 || contrast !== 100) {
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    }
    
    // Draw the image centered
    ctx.drawImage(
      img,
      -img.width * scale / 2,
      -img.height * scale / 2,
      img.width * scale,
      img.height * scale
    );
    
    // Restore context state
    ctx.restore();
    
    // Draw crop area if in crop mode
    if (editMode === 'crop' && isCropping && cropStart.x !== cropEnd.x && cropStart.y !== cropEnd.y) {
      drawCropArea(ctx);
    }
  };
  
  // Draw crop area
  const drawCropArea = (ctx) => {
    // Calculate crop dimensions
    const cropX = Math.min(cropStart.x, cropEnd.x);
    const cropY = Math.min(cropStart.y, cropEnd.y);
    const cropWidth = Math.abs(cropEnd.x - cropStart.x);
    const cropHeight = Math.abs(cropEnd.y - cropStart.y);
    
    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.rect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.rect(cropX, cropY, cropWidth, cropHeight);
    ctx.fill('evenodd');
    
    // Draw border around crop area
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);
    
    // Draw corners
    const cornerSize = 10;
    ctx.fillStyle = '#ffffff';
    
    // Top-left corner
    ctx.fillRect(cropX - cornerSize/2, cropY - cornerSize/2, cornerSize, cornerSize);
    // Top-right corner
    ctx.fillRect(cropX + cropWidth - cornerSize/2, cropY - cornerSize/2, cornerSize, cornerSize);
    // Bottom-left corner
    ctx.fillRect(cropX - cornerSize/2, cropY + cropHeight - cornerSize/2, cornerSize, cornerSize);
    // Bottom-right corner
    ctx.fillRect(cropX + cropWidth - cornerSize/2, cropY + cropHeight - cornerSize/2, cornerSize, cornerSize);
  };
  
  // Mouse events for cropping
  const handleMouseDown = (e) => {
    if (editMode !== 'crop') return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCropStart({ x, y });
    setCropEnd({ x, y });
    setIsCropping(true);
  };
  
  const handleMouseMove = (e) => {
    if (!isCropping || editMode !== 'crop') return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvasRef.current.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(canvasRef.current.height, e.clientY - rect.top));
    
    setCropEnd({ x, y });
    drawInitialImage();
  };
  
  const handleMouseUp = () => {
    if (editMode !== 'crop') return;
    setIsCropping(false);
  };
  
  // Apply rotation
  const handleRotate = (degrees) => {
    setRotation((prev) => (prev + degrees) % 360);
  };
  
  // Apply crop
  const applyCrop = () => {
    if (!canvasRef.current || !imageRef.current || !isCropping) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Get crop dimensions
    const cropX = Math.min(cropStart.x, cropEnd.x);
    const cropY = Math.min(cropStart.y, cropEnd.y);
    const cropWidth = Math.abs(cropEnd.x - cropStart.x);
    const cropHeight = Math.abs(cropEnd.y - cropStart.y);
    
    // Create a new canvas for the cropped image
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;
    
    // Draw the cropped portion
    const croppedCtx = croppedCanvas.getContext('2d');
    croppedCtx.drawImage(
      canvas,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    );
    
    // Update the image reference
    const newImg = new Image();
    newImg.onload = () => {
      imageRef.current = newImg;
      setIsCropping(false);
      setCropStart({ x: 0, y: 0 });
      setCropEnd({ x: 0, y: 0 });
      drawInitialImage();
    };
    newImg.src = croppedCanvas.toDataURL('image/png');
  };
  
  // Reset the image to original
  const resetImage = () => {
    if (!image) return;
    
    // Reset all edit states
    setRotation(0);
    setZoom(1);
    setBrightness(100);
    setContrast(100);
    setFlipHorizontal(false);
    setFlipVertical(false);
    
    // Reset cropping
    setIsCropping(false);
    setCropStart({ x: 0, y: 0 });
    setCropEnd({ x: 0, y: 0 });
    
    // Reset image
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      drawInitialImage();
    };
    img.src = image.preview;
  };
  
  // Save the edited image
  const saveImage = async () => {
    if (!canvasRef.current) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Convert canvas to blob
      const canvas = canvasRef.current;
      const blob = await new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
      });
      
      if (!blob) {
        throw new Error('Failed to convert canvas to blob');
      }
      
      // Create File object
      const file = new File([blob], image.name || 'edited-image.jpg', {
        type: 'image/jpeg',
      });
      
      // Create object URL for preview
      const preview = URL.createObjectURL(blob);
      
      // Call save callback
      onSave({
        file,
        preview,
        name: image.name || 'edited-image.jpg',
        size: blob.size,
        type: 'image/jpeg'
      });
      
      // Close the editor
      onHide();
    } catch (err) {
      console.error('Error saving image:', err);
      setError('Failed to save edited image: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  useEffect(() => {
    drawInitialImage();
  }, [rotation, zoom, brightness, contrast, flipHorizontal, flipVertical, editMode]);
  
  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="image-editor-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon={faCrop} className="me-2" />
          Edit Image
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}
        
        <div className="image-editor-container">
          <div className="canvas-container">
            <canvas
              ref={canvasRef}
              className="editor-canvas"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
          
          <div className="editing-tools">
            <Row className="mb-3">
              <Col>
                <div className="btn-group w-100">
                  <Button
                    variant={editMode === 'crop' ? 'primary' : 'outline-primary'}
                    onClick={() => setEditMode('crop')}
                    title="Crop"
                  >
                    <FontAwesomeIcon icon={faCrop} />
                  </Button>
                  <Button
                    variant={editMode === 'rotate' ? 'primary' : 'outline-primary'}
                    onClick={() => setEditMode('rotate')}
                    title="Rotate"
                  >
                    <FontAwesomeIcon icon={faUndo} />
                  </Button>
                  <Button
                    variant={editMode === 'adjust' ? 'primary' : 'outline-primary'}
                    onClick={() => setEditMode('adjust')}
                    title="Adjust"
                  >
                    <FontAwesomeIcon icon={faAdjust} />
                  </Button>
                </div>
              </Col>
            </Row>
            
            {editMode === 'crop' && (
              <div className="tool-section">
                <h5>Crop</h5>
                <div className="d-grid">
                  <Button
                    variant="primary"
                    onClick={applyCrop}
                    disabled={!isCropping || (cropStart.x === cropEnd.x || cropStart.y === cropEnd.y)}
                  >
                    Apply Crop
                  </Button>
                </div>
                <p className="text-muted small mt-2">
                  Click and drag on the image to select the crop area.
                </p>
              </div>
            )}
            
            {editMode === 'rotate' && (
              <div className="tool-section">
                <h5>Rotate & Flip</h5>
                <div className="btn-group w-100 mb-3">
                  <Button
                    variant="outline-primary"
                    onClick={() => handleRotate(-90)}
                    title="Rotate Left"
                  >
                    <FontAwesomeIcon icon={faRotateLeft} />
                  </Button>
                  <Button
                    variant="outline-primary"
                    onClick={() => handleRotate(90)}
                    title="Rotate Right"
                  >
                    <FontAwesomeIcon icon={faRotateRight} />
                  </Button>
                  <Button
                    variant={flipHorizontal ? 'primary' : 'outline-primary'}
                    onClick={() => setFlipHorizontal(!flipHorizontal)}
                    title="Flip Horizontal"
                  >
                    <FontAwesomeIcon icon={faUnderline} className="flip-h" />
                  </Button>
                  <Button
                    variant={flipVertical ? 'primary' : 'outline-primary'}
                    onClick={() => setFlipVertical(!flipVertical)}
                    title="Flip Vertical"
                  >
                    <FontAwesomeIcon icon={faUnderline} className="flip-v" />
                  </Button>
                </div>
                
                <h5>Zoom</h5>
                <Form.Group className="mb-3">
                  <Form.Label>Zoom: {Math.round(zoom * 100)}%</Form.Label>
                  <Form.Range
                    min="50"
                    max="200"
                    step="5"
                    value={zoom * 100}
                    onChange={(e) => setZoom(parseInt(e.target.value) / 100)}
                  />
                </Form.Group>
                
                <div className="btn-group w-100">
                  <Button
                    variant="outline-primary"
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                    title="Zoom Out"
                  >
                    <FontAwesomeIcon icon={faCompress} />
                  </Button>
                  <Button
                    variant="outline-primary"
                    onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                    title="Zoom In"
                  >
                    <FontAwesomeIcon icon={faExpandArrowsAlt} />
                  </Button>
                </div>
              </div>
            )}
            
            {editMode === 'adjust' && (
              <div className="tool-section">
                <h5>Adjustments</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Brightness: {brightness}%</Form.Label>
                  <Form.Range
                    min="50"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Contrast: {contrast}%</Form.Label>
                  <Form.Range
                    min="50"
                    max="150"
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                  />
                </Form.Group>
              </div>
            )}
            
            <div className="reset-section mt-3">
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={resetImage}
              >
                Reset All Changes
              </Button>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={saveImage}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Saving...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSave} className="me-2" />
              Save Changes
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImageEditor; 