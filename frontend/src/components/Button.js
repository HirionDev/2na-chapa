import { forwardRef } from 'react';

const Button = forwardRef(({ children, variant = 'primary', className = '', ...props }, ref) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all';
  const variantStyles = {
    primary: 'bg-yellow-400 text-black hover:bg-yellow-500 focus:ring-yellow-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
      aria-label={props['aria-label'] || children}
    >
      {children}
    </button>
  );
});

export default Button;