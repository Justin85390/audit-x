import React from 'react';

export function Button({ children, ...props }: { children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700" {...props}>
      {children}
    </button>
  );
}