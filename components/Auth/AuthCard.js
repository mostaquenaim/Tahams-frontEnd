import Link from 'next/link';

// Centered card used by login / register / forgot-password.
const AuthCard = ({ title, subtitle, children, footer }) => (
  <div className="min-h-screen bg-gray-50 px-4 pb-16 pt-40 lg:pt-52">
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <Link href="/" aria-label="Tahams home" className="inline-block">
            <img
              src="/logo-removebg.png"
              alt="Tahams"
              className="mx-auto h-16 w-16 rounded-full border-2 border-white bg-black p-2.5"
            />
          </Link>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-gray-900">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className="mt-6">{children}</div>
      </div>
      {footer && (
        <p className="mt-5 text-center text-sm text-gray-600">{footer}</p>
      )}
    </div>
  </div>
);

export default AuthCard;
