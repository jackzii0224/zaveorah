import React from 'react';

// FIX: Add `onClick` prop to make the Card component clickable, which was causing a type error in `Learning.tsx`.
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div onClick={onClick} className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg transition-shadow duration-300 hover:shadow-xl ${className}`}>
      {children}
    </div>
  );
};

export default Card;
