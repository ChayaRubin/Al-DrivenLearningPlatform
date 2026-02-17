import type { ReactNode } from 'react';

type Props = { children: ReactNode; className?: string };

export function PaginationBar({ children, className = '' }: Props) {
  return (
    <div className={`pagination-bar ${className}`.trim()}>
      <div className="pagination-bar-inner">
        {children}
      </div>
    </div>
  );
}
