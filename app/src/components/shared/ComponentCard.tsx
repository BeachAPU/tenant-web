import React from 'react';

interface ComponentCardProps {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  desc?: React.ReactNode;
  // Right-aligned control(s) on the title row, e.g. the add/new button.
  headerAction?: React.ReactNode;
  // A list's lone search/filter field, placed on the title row. With two or
  // more filters, put them in the card body above the table instead.
  headerSearch?: React.ReactNode;
}

// DESIGN.md §4: grey outer panel with the title row, white inner body panel.
const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = '',
  desc,
  headerAction,
  headerSearch,
}) => {
  return (
    <div className={`light-panel rounded-2xl ${className}`}>
      <div className="px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="order-1 flex-1 text-base font-medium light-text-navy">{title}</h3>
          {headerSearch && (
            <div className="order-3 basis-full sm:order-2 sm:basis-auto sm:w-64">{headerSearch}</div>
          )}
          {headerAction && <div className="order-2 sm:order-3">{headerAction}</div>}
        </div>
        {desc && <p className="mt-1 text-sm light-muted">{desc}</p>}
      </div>

      <div className="light-panel-inner p-4 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
