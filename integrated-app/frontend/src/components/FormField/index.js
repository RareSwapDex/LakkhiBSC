import React from 'react';
import { Form } from 'react-bootstrap';
import './styles.css';

const FormField = ({
  controlId,
  label,
  type = 'text',
  as,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  readOnly = false,
  maxLength,
  showCharCount = false,
  children,
  custom = false,
  className = '',
  ...props
}) => {
  if (custom) {
    return (
      <Form.Group controlId={controlId} className={`form-field ${required ? 'required-field' : ''} ${className}`}>
        {label && <Form.Label>{label}</Form.Label>}
        {children}
        {error && <div className="invalid-feedback d-block">{error}</div>}
      </Form.Group>
    );
  }
  
  return (
    <Form.Group controlId={controlId} className={`form-field ${required ? 'required-field' : ''} ${className}`}>
      {label && <Form.Label>{label}</Form.Label>}
      <Form.Control
        type={type}
        as={as}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        isInvalid={!!error}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        {...props}
      />
      {showCharCount && maxLength && (
        <div className="char-counter">
          <small className={`${value.length > (maxLength * 0.9) ? 'text-danger' : 'text-muted'}`}>
            {value.length}/{maxLength} characters
          </small>
        </div>
      )}
      {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
    </Form.Group>
  );
};

export default FormField; 