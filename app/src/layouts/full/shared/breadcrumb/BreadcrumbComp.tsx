import { JSX } from 'react';
import { Link } from 'react-router';

interface BreadcrumbItem {
  title: string;
  to?: string;
}

interface BreadCrumbType {
  subtitle?: string;
  items?: BreadcrumbItem[];
  title: string;
  children?: JSX.Element;
}

// DESIGN.md §4: page title on the left, "Home > Page" trail on the right.
const BreadcrumbComp = ({ title, items = [] }: BreadCrumbType) => {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-bold light-text-navy">{title}</h2>

      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 whitespace-nowrap">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className="flex items-center gap-1.5 text-sm light-text-navy">
                {item.to && !isLast ? (
                  <Link to={item.to} className="hover:opacity-80">
                    {item.title}
                  </Link>
                ) : (
                  <span aria-current={isLast ? 'page' : undefined}>{item.title}</span>
                )}

                {!isLast && (
                  <svg
                    className="stroke-current"
                    width="17"
                    height="16"
                    viewBox="0 0 17 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default BreadcrumbComp;
