import React from 'react';

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary',
  className = '', 
  disabled = false, 
  onClick, 
  ...props 
}) => {
  const getVariantClasses = () => {
    if (disabled) {
      return 'opacity-50 cursor-not-allowed transform-none';
    }
    
    switch (variant) {
      case 'primary':
        return 'btn-primary';
      case 'secondary':
        return 'btn-secondary';
      case 'danger':
        return 'btn-danger';
      case 'success':
        return 'btn-success';
      case 'outline':
        return 'btn-outline';
      default:
        return 'btn-primary';
    }
  };
  
  const combinedClasses = `${getVariantClasses()} ${className}`;

  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
