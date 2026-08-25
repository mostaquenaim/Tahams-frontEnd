// components/Forms/ArtistApplicationForm.js
import { useForm, ValidationError } from '@formspree/react';

const ArtistApplicationForm = () => {
  const [state, handleSubmit] = useForm(process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID);

  if (state.succeeded) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h3 className="text-2xl font-bold mb-2">Thank you!</h3>
        <p className="text-gray-600">
          Your application has been submitted. We'll be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Name *
        </label>
        <input
          type="text"
          name="name"
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Enter your name"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Email *
        </label>
        <input
          type="email"
          name="email"
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Enter your email"
          required
        />
        <ValidationError prefix="Email" field="email" errors={state.errors} className="text-red-500 text-sm mt-1" />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Portfolio Link
        </label>
        <input
          type="url"
          name="portfolio"
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Enter your portfolio link"
        />
        <ValidationError prefix="Portfolio" field="portfolio" errors={state.errors} className="text-red-500 text-sm mt-1" />
      </div>

      <button
        type="submit"
        disabled={state.submitting}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {state.submitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default ArtistApplicationForm;