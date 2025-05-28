import { useState, useCallback } from 'react';

export const useForm = ({
  initialValues,
  validate, // (values) => errors object
  onSubmit,   // async (values) => void
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null); // For API/general submission errors

  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    setValues((prevValues) => ({
      ...prevValues,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setErrors({}); 
    setSubmitError(null);

    const validationErrors = validate ? validate(values) : {};
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // Stop submission if validation fails
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      // Caller's onSubmit should handle success (e.g., toast, navigation, form reset)
    } catch (error) {
      // Capture error from the onSubmit function (e.g., API call failure)
      console.error("Form submission error:", error);
      setSubmitError(error.message || 'An unexpected error occurred.');
      // Caller can also use this submitError to show a toast or a general form error message
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setSubmitError(null);
    // setIsSubmitting(false); // Usually not needed to reset isSubmitting here, but can be added
  }, [initialValues]);

  return {
    values,
    errors, // For inline field errors
    isSubmitting,
    submitError, // For a general form error message
    handleChange,
    handleSubmit,
    setValues,    // Allow direct manipulation if needed
    setErrors,    // To manually set errors (e.g., from server-side validation)
    resetForm,
  };
}; 