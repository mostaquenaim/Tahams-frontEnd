import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { FiCheck, FiChevronDown, FiSearch, FiX } from 'react-icons/fi';
import { useOnClickOutside } from 'usehooks-ts';

// Shared building blocks for admin list/table pages. Visual language follows
// the AdminDrawer: neutral grays, gray-900 as the primary colour, rounded-lg
// controls and one semantic colour per status tone.

export const cx = (...classes) => classes.filter(Boolean).join(' ');

const BADGE_TONES = {
  neutral: 'bg-gray-100 text-gray-700 ring-gray-500/15',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  danger: 'bg-red-50 text-red-700 ring-red-600/20',
  info: 'bg-sky-50 text-sky-700 ring-sky-600/20',
};

const DOT_TONES = {
  neutral: 'bg-gray-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-sky-500',
};

const ICON_TONES = {
  neutral: 'bg-gray-100 text-gray-600',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-red-50 text-red-600',
  info: 'bg-sky-50 text-sky-600',
};

/* ------------------------------------------------------------------ */
/* Page layout                                                         */
/* ------------------------------------------------------------------ */

const PAGE_WIDTHS = {
  default: 'max-w-[1600px]',
  narrow: 'max-w-6xl',
};

export function AdminPage({ title, width = 'default', children }) {
  return (
    <>
      <Head>
        <title>{`${title} | Tahams Admin`}</title>
      </Head>
      <div className={cx('mx-auto w-full', PAGE_WIDTHS[width])}>
        {children}
      </div>
    </>
  );
}

// `eyebrow` sits above the title (e.g. a back link); `badge` sits beside it.
export function PageHeader({ eyebrow, title, badge, description, actions }) {
  return (
    <div className="mb-6">
      {eyebrow && <div className="mb-3">{eyebrow}</div>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}

// White card with an optional titled header, for detail pages.
export function Section({
  title,
  icon,
  actions,
  bodyClassName = 'p-5',
  children,
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {(title || actions) && (
        <div className="flex min-h-[3.25rem] items-center justify-between gap-3 border-b border-gray-200 px-5 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            {icon && (
              <span className="text-gray-400 [&_svg]:h-4 [&_svg]:w-4">
                {icon}
              </span>
            )}
            <h2 className="truncate text-sm font-semibold text-gray-900">
              {title}
            </h2>
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-1">{actions}</div>
          )}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function DetailList({ children }) {
  return <dl className="divide-y divide-gray-100">{children}</dl>;
}

// Label/value row. `stacked` puts the value under the label for long text.
export function DetailItem({ label, stacked = false, children }) {
  return (
    <div
      className={cx(
        'flex gap-4 py-2.5 first:pt-0 last:pb-0',
        stacked ? 'flex-col gap-1' : 'items-start justify-between',
      )}
    >
      <dt className="shrink-0 text-sm text-gray-500">{label}</dt>
      <dd
        className={cx(
          'min-w-0 break-words text-sm font-medium text-gray-900',
          !stacked && 'text-right',
        )}
      >
        {children}
      </dd>
    </div>
  );
}

const STAT_GRID_COLS = {
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

export function StatGrid({ cols = 3, children }) {
  return (
    <div
      className={cx(
        'mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2',
        STAT_GRID_COLS[cols],
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, hint, icon, tone = 'neutral' }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {icon && (
          <span
            className={cx(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg [&_svg]:h-4 [&_svg]:w-4',
              ICON_TONES[tone],
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-gray-900">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {icon && (
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400 [&_svg]:h-5 [&_svg]:w-5">
          {icon}
        </span>
      )}
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

export function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={cx('animate-spin', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

const BUTTON_BASE =
  'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50';

const BUTTON_VARIANTS = {
  primary: 'bg-gray-900 text-white shadow-sm hover:bg-gray-800',
  secondary:
    'border border-gray-200 bg-white text-gray-700 shadow-sm hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
  success: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700',
  ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  'ghost-danger': 'text-gray-500 hover:bg-red-50 hover:text-red-600',
  'ghost-success': 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700',
  plain: '',
};

const BUTTON_SIZES = {
  sm: 'h-8 gap-1.5 px-2.5 text-xs [&_svg]:h-3.5 [&_svg]:w-3.5',
  md: 'h-9 gap-2 px-3.5 text-sm [&_svg]:h-4 [&_svg]:w-4',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  loading = false,
  href,
  className,
  children,
  type = 'button',
  disabled,
  ...props
}) {
  const classes = cx(
    BUTTON_BASE,
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    className,
  );
  const content = (
    <>
      {loading ? <Spinner /> : icon}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
}

const ICON_BUTTON_SIZES = {
  sm: 'h-7 w-7 [&_svg]:h-3.5 [&_svg]:w-3.5',
  md: 'h-8 w-8 [&_svg]:h-4 [&_svg]:w-4',
};

// Icon-only button. `label` doubles as the tooltip and the accessible name.
export function IconButton({
  label,
  icon,
  variant = 'ghost',
  size = 'md',
  href,
  className,
  type = 'button',
  ...props
}) {
  const classes = cx(
    BUTTON_BASE,
    BUTTON_VARIANTS[variant],
    ICON_BUTTON_SIZES[size],
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={label}
        title={label}
        className={classes}
        {...props}
      >
        {icon}
      </Link>
    );
  }

  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={classes}
      {...props}
    >
      {icon}
    </button>
  );
}

// "Check" / "Checked" review toggle used on order-like lists. Hovering a
// checked item previews the uncheck action.
export function CheckToggle({ checked, loading, onClick, size = 'sm' }) {
  return (
    <Button
      size={size}
      loading={loading}
      onClick={onClick}
      variant={checked ? 'plain' : 'secondary'}
      title={checked ? 'Checked - click to uncheck' : 'Mark as checked'}
      className={cx(
        'group/check w-[5.75rem]',
        checked &&
          'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700',
      )}
    >
      {!loading &&
        (checked ? (
          <>
            <FiCheck className="group-hover/check:hidden" />
            <FiX className="hidden group-hover/check:block" />
          </>
        ) : (
          <FiCheck />
        ))}
      {checked ? (
        <>
          <span className="group-hover/check:hidden">Checked</span>
          <span className="hidden group-hover/check:inline">Uncheck</span>
        </>
      ) : (
        'Check'
      )}
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* Form controls                                                       */
/* ------------------------------------------------------------------ */

const CONTROL =
  'rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500';

const CONTROL_HEIGHTS = { sm: 'h-8', md: 'h-9' };

// Native onChange (receives the event), like a plain <input>.
export function Input({ size = 'md', className, ...props }) {
  return (
    <input
      className={cx(CONTROL, CONTROL_HEIGHTS[size], className)}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cx(
        CONTROL,
        'block w-full resize-none py-2.5 leading-relaxed',
        className,
      )}
      {...props}
    />
  );
}

// onValueChange receives the string value, not the event.
export function SearchInput({
  value,
  onValueChange,
  placeholder = 'Search...',
  className,
}) {
  return (
    <div
      className={cx(
        'relative w-full sm:w-auto sm:min-w-[16rem] sm:flex-1 lg:max-w-md',
        className,
      )}
    >
      <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cx(CONTROL, 'h-9 w-full pl-9 pr-8')}
      />
      {value && (
        <button
          type="button"
          onClick={() => onValueChange('')}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          <FiX className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

// onValueChange receives the string value, not the event.
export function Select({
  value,
  onValueChange,
  width = 'w-full sm:w-48',
  size = 'md',
  children,
  ...props
}) {
  return (
    <div className={cx('relative', width)}>
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={cx(
          CONTROL,
          CONTROL_HEIGHTS[size],
          'w-full cursor-pointer appearance-none pr-9',
        )}
        {...props}
      >
        {children}
      </select>
      <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
  );
}

export function Checkbox({ className, ...props }) {
  return (
    <input
      type="checkbox"
      className={cx(
        'h-4 w-4 cursor-pointer rounded border-gray-300 accent-gray-900 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  );
}

// A checkbox styled as a toolbar control, e.g. "Hide cancelled".
export function CheckboxField({ label, className, ...props }) {
  return (
    <label
      className={cx(
        'inline-flex h-9 cursor-pointer select-none items-center gap-2 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm transition-colors hover:bg-gray-50',
        className,
      )}
    >
      <Checkbox {...props} />
      {label}
    </label>
  );
}

export function FileInput({ className, ...props }) {
  return (
    <input
      type="file"
      className={cx(
        'block w-full text-xs text-gray-600 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-gray-100 file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-gray-700 hover:file:bg-gray-200',
        className,
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Status                                                              */
/* ------------------------------------------------------------------ */

export function Badge({ tone = 'neutral', dot = false, className, children }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        BADGE_TONES[tone],
        className,
      )}
    >
      {dot && (
        <span className={cx('h-1.5 w-1.5 rounded-full', DOT_TONES[tone])} />
      )}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Dropdown menu                                                       */
/* ------------------------------------------------------------------ */

export function Dropdown({
  label,
  icon,
  variant = 'secondary',
  size = 'md',
  align = 'right',
  width = 'w-56',
  closeOnSelect = true,
  disabled,
  children,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useOnClickOutside(ref, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant={variant}
        size={size}
        icon={icon}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {label}
        <FiChevronDown
          className={cx(
            'opacity-60 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            onClick={closeOnSelect ? () => setOpen(false) : undefined}
            className={cx(
              'absolute z-30 mt-1.5 rounded-lg border border-gray-200 bg-white p-1 shadow-lg',
              align === 'right' ? 'right-0' : 'left-0',
              width,
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownLabel({ children }) {
  return (
    <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
      {children}
    </p>
  );
}

export function DropdownItem({ icon, tone, onClick, children }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cx(
        'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors [&_svg]:h-4 [&_svg]:w-4',
        tone === 'danger'
          ? 'text-red-600 hover:bg-red-50 [&_svg]:text-red-500'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 [&_svg]:text-gray-400',
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function DropdownCheckbox({ checked, onChange, disabled, children }) {
  return (
    <label
      className={cx(
        'flex cursor-pointer items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-100',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span>{children}</span>
      <Checkbox checked={checked} onChange={onChange} disabled={disabled} />
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

const MODAL_SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  tone = 'neutral',
  size = 'md',
  children,
  footer,
}) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === 'string' ? title : undefined}
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.15 }}
            className={cx(
              'relative flex max-h-[90vh] w-full flex-col rounded-xl bg-white shadow-xl',
              MODAL_SIZES[size],
            )}
          >
            <div className="flex items-start gap-3 px-5 pt-5">
              {icon && (
                <span
                  className={cx(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full [&_svg]:h-5 [&_svg]:w-5',
                    ICON_TONES[tone],
                  )}
                >
                  {icon}
                </span>
              )}
              <div className="min-w-0 flex-1 pt-0.5">
                <h2 className="text-base font-semibold text-gray-900">
                  {title}
                </h2>
                {description && (
                  <p className="mt-1 text-sm text-gray-500">{description}</p>
                )}
              </div>
              <IconButton
                label="Close"
                icon={<FiX />}
                size="sm"
                onClick={onClose}
                className="-mr-1 -mt-1"
              />
            </div>
            {children ? (
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                {children}
              </div>
            ) : (
              <div className="h-5" />
            )}
            {footer && (
              <div className="flex flex-wrap justify-end gap-2 rounded-b-xl border-t border-gray-100 bg-gray-50 px-5 py-3">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
