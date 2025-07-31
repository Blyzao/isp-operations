import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  gradient = true,
  gradientFrom = 'blue-600',
  gradientTo = 'cyan-400',
  className = '',
  disabled = false,
  loading = false,
  fullWidth = false,
  ...props 
}) => {
  const sizeClasses = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
    xl: 'px-10 py-5 text-lg'
  };

  const baseClasses = [
    'inline-flex items-center justify-center font-bold text-center uppercase align-middle',
    'transition-all duration-200 ease-soft-in-out',
    'border-0 rounded-lg cursor-pointer',
    'leading-pro tracking-tight-soft',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    sizeClasses[size],
    disabled || loading ? 'opacity-65 cursor-not-allowed' : 'hover:scale-102 active:opacity-85'
  ];

  const variantClasses = {
    primary: gradient 
      ? [
          `bg-gradient-to-tl from-${gradientFrom} to-${gradientTo}`,
          'text-white',
          'shadow-[0_4px_7px_-1px_rgba(0,0,0,0.11),0_2px_4px_-1px_rgba(0,0,0,0.07)]',
          'hover:shadow-[0_3px_5px_-1px_rgba(0,0,0,0.09),0_2px_3px_-1px_rgba(0,0,0,0.07)]',
          'focus:ring-blue-300'
        ]
      : [
          'bg-blue-600 text-white',
          'hover:bg-blue-700',
          'focus:ring-blue-300'
        ],
    secondary: [
      'bg-transparent border border-solid text-blue-600',
      'border-blue-600 hover:border-blue-700',
      'hover:bg-blue-50 hover:text-blue-700',
      'focus:ring-blue-300'
    ],
    success: gradient
      ? [
          'bg-gradient-to-tl from-green-600 to-lime-400',
          'text-white',
          'shadow-[0_4px_7px_-1px_rgba(0,0,0,0.11),0_2px_4px_-1px_rgba(0,0,0,0.07)]',
          'hover:shadow-[0_3px_5px_-1px_rgba(0,0,0,0.09),0_2px_3px_-1px_rgba(0,0,0,0.07)]',
          'focus:ring-green-300'
        ]
      : [
          'bg-green-600 text-white',
          'hover:bg-green-700',
          'focus:ring-green-300'
        ],
    danger: gradient
      ? [
          'bg-gradient-to-tl from-red-600 to-rose-400',
          'text-white',
          'shadow-[0_4px_7px_-1px_rgba(0,0,0,0.11),0_2px_4px_-1px_rgba(0,0,0,0.07)]',
          'hover:shadow-[0_3px_5px_-1px_rgba(0,0,0,0.09),0_2px_3px_-1px_rgba(0,0,0,0.07)]',
          'focus:ring-red-300'
        ]
      : [
          'bg-red-600 text-white',
          'hover:bg-red-700',
          'focus:ring-red-300'
        ],
    outline: [
      'bg-transparent border border-gray-300 text-gray-700',
      'hover:bg-gray-50 hover:border-gray-400',
      'focus:ring-gray-300'
    ],
    ghost: [
      'bg-transparent text-gray-600',
      'hover:bg-gray-100 hover:text-gray-800',
      'focus:ring-gray-300'
    ]
  };

  if (fullWidth) {
    baseClasses.push('w-full');
  }

  const finalClasses = [
    ...baseClasses,
    ...(variantClasses[variant] || variantClasses.primary),
    className
  ].join(' ');

  return (
    <button 
      className={finalClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-3 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;