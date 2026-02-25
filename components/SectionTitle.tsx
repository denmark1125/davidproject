
import React from 'react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, subtitle }) => {
  return (
    <div className="mb-6 md:mb-12">
      <h2 className="text-2xl md:text-4xl font-bold text-gray-900 border-l-4 md:border-l-8 border-yellow-400 pl-3 md:pl-4 tracking-wider uppercase">
        {title}
      </h2>
      {subtitle && <p className="mt-1 text-[10px] md:text-lg text-gray-400 md:text-gray-500 uppercase tracking-[0.2em] md:tracking-widest">{subtitle}</p>}
    </div>
  );
};
