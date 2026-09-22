import Link from 'next/link';
import { FiClock, FiMail, FiPhone } from 'react-icons/fi';
import {
  CONTACT,
  BackLink,
  buttonPrimary,
} from './Storefront/StorefrontUI';

// Placeholder for info pages that don't have content yet. Rather than a dead
// end, it points customers at the ways they can reach us today.
const ComingSoon = ({ pageTitle }) => {
  return (
    <section className="flex min-h-screen items-center justify-center bg-gray-50 px-4 pb-16 pt-40 lg:pt-52">
      <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <FiClock className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          {pageTitle}
        </h1>
        <p className="mt-2 text-gray-500">
          We&apos;re still putting this page together. In the meantime, we&apos;re
          happy to help directly.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a href={`tel:${CONTACT.phone}`} className={buttonPrimary}>
            <FiPhone className="h-4 w-4" />
            Call us
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:border-gray-400"
          >
            <FiMail className="h-4 w-4" />
            Send a message
          </Link>
        </div>

        <div className="mt-6">
          <BackLink href="/">Back to home</BackLink>
        </div>
      </div>
    </section>
  );
};

export default ComingSoon;
