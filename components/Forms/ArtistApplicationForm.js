// components/Forms/ArtistApplicationForm.js
import { useForm, ValidationError } from '@formspree/react';

const ArtistApplicationForm = () => {
  const [state, handleSubmit] = useForm(process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID);

  if (state.succeeded) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">Thank you!</h3>
        <p className="text-gray-600">
          Your application has been submitted. We&apos;ll be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Name *
        </label>
        <input
          type="text"
          name="name"
          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
          placeholder="Enter your name"
          required
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Email *
        </label>
        <input
          type="email"
          name="email"
          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
          placeholder="Enter your email"
          required
        />
        <ValidationError prefix="Email" field="email" errors={state.errors} className="text-xs text-red-600 mt-1" />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Portfolio Link
        </label>
        <input
          type="url"
          name="portfolio"
          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
          placeholder="Enter your portfolio link"
        />
        <ValidationError prefix="Portfolio" field="portfolio" errors={state.errors} className="text-xs text-red-600 mt-1" />
      </div>

      <button
        type="submit"
        disabled={state.submitting}
        className="w-full rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50 sm:w-auto"
      >
        {state.submitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default ArtistApplicationForm;