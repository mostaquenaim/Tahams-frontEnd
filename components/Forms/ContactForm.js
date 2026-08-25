// components/Forms/ContactForm.js
import { useForm, ValidationError } from '@formspree/react';

const ContactForm = () => {
  const [state, handleSubmit] = useForm(process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID);

  if (state.succeeded) {
    return (
      <div className="bg-white p-8 shadow-lg rounded-lg text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Thank you!</h2>
        <p className="text-gray-600">Your message has been sent. We'll get back to you soon.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Contact Form</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Your Name *
          </label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Enter your name"
            className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Your Email *
          </label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
            required
          />
          <ValidationError prefix="Email" field="email" errors={state.errors} className="text-red-500 text-sm mt-1" />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Your Message *
          </label>
          <textarea
            name="message"
            id="message"
            rows="4"
            placeholder="Write your message"
            className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
            required
          ></textarea>
          <ValidationError prefix="Message" field="message" errors={state.errors} className="text-red-500 text-sm mt-1" />
        </div>

        <button
          type="submit"
          disabled={state.submitting}
          className="w-full py-3 px-4 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition disabled:opacity-50"
        >
          {state.submitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;