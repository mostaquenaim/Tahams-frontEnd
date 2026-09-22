// components/Forms/ContactForm.js
import { useForm, ValidationError } from '@formspree/react';
import { FiCheckCircle } from 'react-icons/fi';
import { inputClass, buttonPrimary } from '../Storefront/StorefrontUI';

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

const ContactForm = () => {
  const [state, handleSubmit] = useForm(
    process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID,
  );

  if (state.succeeded) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <FiCheckCircle className="mx-auto h-10 w-10 text-green-600" />
        <h2 className="mt-3 text-xl font-semibold text-gray-900">Thank you!</h2>
        <p className="mt-1 text-sm text-gray-500">
          Your message has been sent. We&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-semibold text-gray-900">Send us a message</h2>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="name" className={labelClass}>
            Your name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            autoComplete="name"
            placeholder="Enter your name"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Your email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
            required
          />
          <ValidationError
            prefix="Email"
            field="email"
            errors={state.errors}
            className="mt-1 text-xs text-red-600"
          />
        </div>

        <div>
          <label htmlFor="message" className={labelClass}>
            Your message
          </label>
          <textarea
            name="message"
            id="message"
            rows="5"
            placeholder="How can we help?"
            className={inputClass}
            required
          ></textarea>
          <ValidationError
            prefix="Message"
            field="message"
            errors={state.errors}
            className="mt-1 text-xs text-red-600"
          />
        </div>

        <button
          type="submit"
          disabled={state.submitting}
          className={`${buttonPrimary} w-full`}
        >
          {state.submitting ? 'Sending...' : 'Send message'}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
