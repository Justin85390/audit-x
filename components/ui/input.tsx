import React from 'react';

export function Input({ ...props }) {
  return (
    <input className="p-2 border rounded w-full focus:outline-none focus:ring focus:border-blue-300" {...props} />
  );
}