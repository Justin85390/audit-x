import React from 'react';

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="p-2 border rounded w-full focus:outline-none focus:ring focus:border-blue-300 resize-vertical"
      {...props}
    />
  );
}