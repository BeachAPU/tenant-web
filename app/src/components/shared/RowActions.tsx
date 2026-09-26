import React from 'react';
import { Link } from 'react-router';

type RowActionKind = 'action' | 'edit' | 'delete';

const KIND_CLASS: Record<RowActionKind, string> = {
  action: 'light-link-action',
  edit: 'light-link-edit',
  delete: 'light-link-delete',
};

interface RowActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // DESIGN.md §5: edit/open = green, delete/remove = red, anything else = brand blue.
  kind?: RowActionKind;
  // Render as a router link instead of a button (e.g. "Open").
  to?: string;
}

export const RowAction = ({ kind = 'action', to, className = '', children, ...props }: RowActionProps) => {
  const classes = `${KIND_CLASS[kind]} font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${className}`;
  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
};

// Row actions container; order children neutral -> edit -> delete.
export const RowActions = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex items-center gap-4 text-sm ${className}`}>{children}</div>
);
