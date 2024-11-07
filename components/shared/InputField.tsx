import React from 'react';

interface InputFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  type = 'text',
  multiline = false,
  className = ''
}) => {
  const baseClasses = 'border-2 border-gray-700 rounded-md p-2 w-full focus:outline-none focus:border-blue-500 transition-colors';
  
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${baseClasses} min-h-[100px] ${className}`}
      />
    );
  }

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${baseClasses} ${className}`}
    />
  );
};

export default InputField; 