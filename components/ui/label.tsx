import React from 'react';

export function Label({ children, ...props }: { children: React.ReactNode } & React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className="block mb-2 text-sm font-bold text-gray-700" {...props}>
      {children}
    </label>
  );
}