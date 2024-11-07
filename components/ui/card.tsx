import React from 'react';

type CardProps = {
  children: React.ReactNode;
};

export function Card({ children }: CardProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      {children}
    </div>
  );
}

type CardContentProps = {
  children: React.ReactNode;
};

export function CardContent({ children }: CardContentProps) {
  return (
    <div className="mt-2">
      {children}
    </div>
  );
}

type CardHeaderProps = {
  children: React.ReactNode;
};

export function CardHeader({ children }: CardHeaderProps) {
  return (
    <div className="text-xl font-bold mb-2">
      {children}
    </div>
  );
}

type CardTitleProps = {
  children: React.ReactNode;
};

export function CardTitle({ children }: CardTitleProps) {
  return (
    <h2 className="text-lg font-semibold">
      {children}
    </h2>
  );
}