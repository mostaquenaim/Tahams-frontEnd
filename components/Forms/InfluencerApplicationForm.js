// components/Forms/InfluencerApplicationForm.js
import { useForm, ValidationError } from '@formspree/react';

const InfluencerApplicationForm = () => {
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
          Name
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
          Email
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
          Social Media Handle
        </label>
        <input
          type="text"
          name="socialMediaHandle"
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Enter your social media handle"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Audience Details
        </label>
        <textarea
          name="audienceDetails"
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Tell us about your audience"
          rows="4"
          required
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={state.submitting}
        className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50"
      >
        {state.submitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default InfluencerApplicationForm;