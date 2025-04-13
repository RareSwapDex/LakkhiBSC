import React, { useState, useEffect } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import './styles.css';

const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  validate,
  errorMessage,
  disabled = false,
  readOnly = false,
  className = '',
  as,
  rows,
  min,
  max,
  step,
  helpText,
  hideValidation = false,
  showFeedback = true,
  children,
  prependElement,
  appendElement,
  maxLength,
  pattern,
  ...props
}) => {
  const [isTouched, setIsTouched] = useState(false);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  
  // Validate whenever value changes, but only show error if field has been touched
  useEffect(() => {
    if (validate && value !== undefined) {
      if (validate(value)) {
        setIsValid(true);
        setError('');
      } else {
        setIsValid(false);
        setError(errorMessage || 'Invalid input');
      }
    } else if (required && !value && isTouched) {
      setIsValid(false);
      setError(`${label} is required`);
    } else {
      setIsValid(true);
      setError('');
    }
  }, [value, validate, errorMessage, required, label, isTouched]);
  
  const handleBlur = () => {
    setIsTouched(true);
  };
  
  const renderControl = () => {
    const controlProps = {
      type,
      value: value || '',
      onChange,
      onBlur: handleBlur,
      placeholder,
      required,
      disabled,
      readOnly,
      className: `${className} ${isTouched && !hideValidation ? (isValid ? 'is-valid' : error ? 'is-invalid' : '') : ''}`,
      isValid: isTouched && isValid && showFeedback && !hideValidation,
      isInvalid: isTouched && !isValid && error && showFeedback && !hideValidation,
      as,
      rows,
      min,
      max,
      step,
      maxLength,
      pattern,
      ...props
    };
    
    if (prependElement || appendElement) {
      return (
        <InputGroup>
          {prependElement && <InputGroup.Text>{prependElement}</InputGroup.Text>}
          <Form.Control {...controlProps} />
          {appendElement && <InputGroup.Text>{appendElement}</InputGroup.Text>}
          {children}
        </InputGroup>
      );
    }
    
    return (
      <>
        <Form.Control {...controlProps} />
        {children}
      </>
    );
  };
  
  return (
    <Form.Group className="mb-3">
      {label && (
        <Form.Label>
          {label}
          {required && <span className="text-danger">*</span>}
        </Form.Label>
      )}
      
      {renderControl()}
      
      {isTouched && error && showFeedback && !hideValidation && (
        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
      )}
      
      {helpText && (
        <Form.Text className="text-muted">{helpText}</Form.Text>
      )}
    </Form.Group>
  );
};

export default FormField; 