import Link from 'next/link';
import { FiArrowLeft, FiChevronRight } from 'react-icons/fi';

// Shared building blocks for storefront pages, matching the cart/checkout look
// (rounded-2xl white cards, gray-100 borders, black primary actions).

export const CONTACT = {
  phone: '+8801602054102',
  phoneLabel: '+88 016020-54102',
  email: 'tahamsbd@gmail.com',
  facebook: 'https://www.facebook.com/tahamsbd/',
  instagram: 'https://www.instagram.com/tahams_bd/',
  messenger: 'https://m.me/111664024670524',
};

export const imageUrl = (filename) =>
  `${process.env.NEXT_PUBLIC_API}/admin/getimage/${filename}`;

// Clears the fixed site header. Use as the outermost wrapper of a page.
export const PageShell = ({ children, className = '', tone = 'white' }) => (
  <section
    className={`min-h-screen px-4 pb-16 pt-40 lg:pt-56 ${
      tone === 'muted' ? 'bg-gray-50' : 'bg-white'
    } ${className}`}
  >
    {children}
  </section>
);

export const PageHeader = ({ eyebrow, title, subtitle, align = 'left', actions }) => (
  <header
    className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${
      align === 'center' ? 'items-center text-center sm:flex-col sm:items-center' : ''
    }`}
  >
    <div>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 max-w-2xl text-sm text-gray-500 sm:text-base">
          {subtitle}
        </p>
      )}
    </div>
    {actions}
  </header>
);

export const Breadcrumbs = ({ items }) => (
  <nav aria-label="Breadcrumb" className="mb-4 text-xs text-gray-500">
    <ol className="flex flex-wrap items-center gap-1">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1">
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-black hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-medium text-gray-800' : ''}>
                {item.label}
              </span>
            )}
            {!isLast && <FiChevronRight className="h-3 w-3 text-gray-300" />}
          </li>
        );
      })}
    </ol>
  </nav>
);

export const Card = ({ children, className = '' }) => (
  <div
    className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${className}`}
  >
    {children}
  </div>
);

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export const buttonPrimary = `${buttonBase} bg-black text-white hover:bg-gray-800 active:scale-[0.98]`;
export const buttonSecondary = `${buttonBase} border border-gray-200 bg-white text-gray-800 hover:border-gray-400`;

export const EmptyState = ({
  icon: Icon,
  title,
  message,
  actionHref,
  actionLabel,
}) => (
  <div className="mx-auto max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
    {Icon && (
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500">
        <Icon className="h-6 w-6" />
      </div>
    )}
    <h2 className="mt-4 text-lg font-semibold text-gray-900">{title}</h2>
    {message && <p className="mt-1 text-sm text-gray-500">{message}</p>}
    {actionHref && (
      <Link href={actionHref} className={`${buttonPrimary} mt-6`}>
        {actionLabel}
      </Link>
    )}
  </div>
);

export const BackLink = ({ href = '/', children = 'Back to home' }) => (
  <Link
    href={href}
    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
  >
    <FiArrowLeft className="h-4 w-4" />
    {children}
  </Link>
);

export const SkeletonGrid = ({ count = 6 }) => (
  <div
    className="grid grid-cols-2 gap-4 md:gap-6 xl:grid-cols-3"
    aria-busy="true"
  >
    {Array.from({ length: count }, (_, key) => (
      <div key={key} className="overflow-hidden rounded-2xl border border-gray-100">
        <div className="aspect-[3/4] animate-pulse bg-gray-100" />
        <div className="space-y-2 p-4">
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    ))}
  </div>
);

// Labelled input used by the auth forms.
export const Field = ({ label, icon: Icon, error, hint, right, children }) => (
  <div className="w-full text-left">
    <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
      {Icon && <Icon className="h-4 w-4 text-gray-400" />}
      {label}
      {hint && <span className="font-normal text-gray-400">{hint}</span>}
    </label>
    <div className="relative">
      {children}
      {right}
    </div>
    {error && (
      <p role="alert" className="mt-1 text-xs text-red-600">
        {error}
      </p>
    )}
  </div>
);

export const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black';
