import React from 'react';
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
} from 'react-icons/fi';
import { EmptyState, Select, cx } from './AdminUI';

const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' };

// `!` so the colour beats the transparent default that <Table accented> puts
// on every row.
const ROW_ACCENTS = {
  success: '!border-l-emerald-500',
  warning: '!border-l-amber-400',
  danger: '!border-l-red-500',
  info: '!border-l-sky-500',
  neutral: '!border-l-gray-300',
};

/* ------------------------------------------------------------------ */
/* Card shell: toolbar / optional selection bar / table / footer       */
/* ------------------------------------------------------------------ */

export function TableCard({ toolbar, selectionBar, footer, scrollRef, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {toolbar && (
        <div className="flex flex-wrap items-center gap-2 rounded-t-xl border-b border-gray-200 p-3">
          {toolbar}
        </div>
      )}
      {selectionBar}
      <div
        ref={scrollRef}
        className={cx(
          'overflow-x-auto',
          !toolbar && !selectionBar && 'rounded-t-xl',
          !footer && 'rounded-b-xl',
        )}
      >
        {children}
      </div>
      {footer}
    </div>
  );
}

// Pushes the controls after it to the right edge of the toolbar on desktop.
export function ToolbarSpacer() {
  return <div className="hidden flex-1 lg:block" aria-hidden="true" />;
}

export function SelectionBar({ count, onClear, children }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2">
      <span className="text-sm font-medium text-gray-900">
        {count} selected
      </span>
      <span className="mx-1 h-4 w-px bg-gray-200" aria-hidden="true" />
      {children}
      <button
        type="button"
        onClick={onClear}
        className="ml-auto text-sm text-gray-500 transition-colors hover:text-gray-900"
      >
        Clear selection
      </button>
    </div>
  );
}

export function TableFooter({ children }) {
  return (
    <div className="flex flex-col gap-3 rounded-b-xl border-t border-gray-200 px-4 py-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Table primitives                                                    */
/* ------------------------------------------------------------------ */

// `accented` reserves a left border on every row so <Tr accent="..."> can
// colour it without shifting the columns.
export function Table({ accented = false, className, children }) {
  return (
    <table
      className={cx(
        'min-w-full divide-y divide-gray-200',
        accented && '[&_tr]:border-l-[3px] [&_tr]:border-l-transparent',
        className,
      )}
    >
      {children}
    </table>
  );
}

export function THead({ children }) {
  return (
    <thead className="bg-gray-50/80">
      <tr>{children}</tr>
    </thead>
  );
}

export function TBody({ children }) {
  return (
    <tbody className="divide-y divide-gray-100 bg-white">{children}</tbody>
  );
}

// Sortable when `sortable` is set; `direction` accepts 'asc'/'desc' or
// 'ascending'/'descending' since pages use both.
export function Th({
  children,
  align = 'left',
  sortable = false,
  active = false,
  direction,
  onSort,
  className,
}) {
  const ascending = direction === 'asc' || direction === 'ascending';
  const SortIcon = active && ascending ? FiChevronUp : FiChevronDown;

  return (
    <th
      scope="col"
      aria-sort={
        sortable && active ? (ascending ? 'ascending' : 'descending') : undefined
      }
      className={cx(
        'whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500',
        ALIGN[align],
        className,
      )}
    >
      {sortable ? (
        <button
          type="button"
          onClick={onSort}
          className={cx(
            'group inline-flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-gray-900 focus:outline-none focus-visible:text-gray-900',
            active && 'text-gray-900',
            align === 'right' && 'flex-row-reverse',
          )}
        >
          {children}
          <SortIcon
            className={cx(
              'h-3.5 w-3.5 transition-opacity',
              active ? 'opacity-100' : 'opacity-0 group-hover:opacity-60',
            )}
          />
        </button>
      ) : (
        children
      )}
    </th>
  );
}

export function Tr({ onClick, accent, className, children }) {
  const handleKeyDown = onClick
    ? (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
          e.preventDefault();
          onClick(e);
        }
      }
    : undefined;

  return (
    <tr
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      className={cx(
        'transition-colors hover:bg-gray-50',
        onClick && 'cursor-pointer focus:outline-none focus-visible:bg-gray-50',
        accent && ROW_ACCENTS[accent],
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function Td({ children, align = 'left', nowrap = false, className, ...props }) {
  return (
    <td
      className={cx(
        'px-4 py-3 align-middle text-sm text-gray-700',
        ALIGN[align],
        nowrap && 'whitespace-nowrap',
        className,
      )}
      {...props}
    >
      {children}
    </td>
  );
}

const SKELETON_WIDTHS = ['w-10', 'w-28', 'w-20', 'w-32', 'w-16', 'w-24'];

export function SkeletonRows({ rows = 6, cols }) {
  return (
    <>
      {Array.from({ length: rows }, (_, row) => (
        <tr key={row}>
          {Array.from({ length: cols }, (_, col) => (
            <td key={col} className="px-4 py-3.5">
              <div
                className={cx(
                  'h-3.5 animate-pulse rounded bg-gray-100',
                  SKELETON_WIDTHS[(row + col) % SKELETON_WIDTHS.length],
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function TableEmpty({ colSpan, ...emptyStateProps }) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <EmptyState {...emptyStateProps} />
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/* Pagination                                                          */
/* ------------------------------------------------------------------ */

const getPageItems = (page, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (page <= 4) return [1, 2, 3, 4, 5, 'end-gap', totalPages];
  if (page >= totalPages - 3) {
    return [
      1,
      'start-gap',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [1, 'start-gap', page - 1, page, page + 1, 'end-gap', totalPages];
};

function PageButton({ active, label, children, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={cx(
        'inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-sm font-medium tabular-nums transition-colors disabled:pointer-events-none disabled:opacity-40 [&_svg]:h-4 [&_svg]:w-4',
        active
          ? 'bg-gray-900 text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Pagination({
  page,
  totalPages,
  totalItems = 0,
  pageSize,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
  itemLabel = 'results',
}) {
  const pageCount = Math.max(totalPages || 0, 1);
  const from = totalItems ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <TableFooter>
      <div className="flex flex-wrap items-center gap-3">
        <p>
          {totalItems ? (
            <>
              Showing{' '}
              <span className="font-medium text-gray-900">
                {from.toLocaleString()}–{to.toLocaleString()}
              </span>{' '}
              of{' '}
              <span className="font-medium text-gray-900">
                {totalItems.toLocaleString()}
              </span>{' '}
              {itemLabel}
            </>
          ) : (
            `No ${itemLabel}`
          )}
        </p>
        {pageSizeOptions && onPageSizeChange && (
          <Select
            value={pageSize}
            onValueChange={(value) => onPageSizeChange(Number(value))}
            width="w-auto"
            size="sm"
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option} / page
              </option>
            ))}
          </Select>
        )}
      </div>

      {pageCount > 1 && (
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <PageButton
            label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <FiChevronLeft />
          </PageButton>
          <span className="px-2 text-gray-700 sm:hidden">
            Page {page} of {pageCount}
          </span>
          <div className="hidden items-center gap-1 sm:flex">
            {getPageItems(page, pageCount).map((item) =>
              typeof item === 'number' ? (
                <PageButton
                  key={item}
                  active={item === page}
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </PageButton>
              ) : (
                <span key={item} className="px-1 text-gray-400">
                  …
                </span>
              ),
            )}
          </div>
          <PageButton
            label="Next page"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            <FiChevronRight />
          </PageButton>
        </nav>
      )}
    </TableFooter>
  );
}
