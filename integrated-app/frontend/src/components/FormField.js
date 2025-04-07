import React, { useState, useEffect } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import './styles.css';

/**
 * FormField Component
 * 
 * Reusable form field with built-in validation and error handling
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Field label
 * @param {string} props.name - Field name
 * @param {string} props.type - Input type (text, email, number, etc.)
 * @param {string} props.value - Current field value
 * @param {Function} props.onChange - Change handler function
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.errorMessage - Custom error message
 * @param {boolean} props.disabled - Whether field is disabled
 * @param {boolean} props.readOnly - Whether field is read-only
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.as - HTML element type
 * @param {number} props.rows - Number of rows for textarea
 * @param {number} props.min - Minimum value
 * @param {number} props.max - Maximum value
 * @param {number} props.step - Step value
 * @param {string} props.helpText - Help text to display
 * @param {boolean} props.hideValidation - Whether to hide validation
 * @param {boolean} props.showFeedback - Whether to show feedback
 * @param {ReactNode} props.children - Additional content to render
 * @param {ReactNode} props.prependElement - Element to prepend to the input
 * @param {ReactNode} props.appendElement - Element to append to the input
 * @param {number} props.maxLength - Maximum length of input
 * @param {string} props.pattern - Regular expression pattern for input validation
 */
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