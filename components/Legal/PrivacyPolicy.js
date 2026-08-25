import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

const SECTIONS = [
  {
    id: 'information-we-collect',
    title: '1. What Information We Collect',
    content: (
      <>
        <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          Information You Provide Directly
        </h3>
        <p className="mb-3">
          When you purchase from TAHAMS or interact with us, we collect:
        </p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>
            <strong>Personal Details</strong>: Your full name, email address,
            and phone number
          </li>
          <li>
            <strong>Contact Information</strong>: Physical address (for
            delivery) and postal code
          </li>
          <li>
            <strong>Payment Information</strong>: Payment method details (card
            numbers processed securely through our payment gateway; we never
            store complete card numbers)
          </li>
          <li>
            <strong>Communication Data</strong>: Messages, feedback,
            inquiries, and customer service correspondence
          </li>
          <li>
            <strong>Size &amp; Preferences</strong>: Your clothing size and
            style preferences (to better assist you)
          </li>
          <li>
            <strong>Order Information</strong>: Purchase history, items
            purchased, quantities, and preferences
          </li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          Information Collected Automatically
        </h3>
        <p className="mb-3">
          When you visit our website or social media pages, we may receive:
        </p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>
            <strong>Device Information</strong>: Type of device, browser
            type, and operating system
          </li>
          <li>
            <strong>Basic Usage Data</strong>: Pages visited, products
            viewed, time spent on our site
          </li>
          <li>
            <strong>General Location</strong>: City and country level
            information (not precise location)
          </li>
        </ul>
        <p className="mt-3 text-sm bg-gray-50 border border-gray-200 rounded-lg p-3">
          <strong>Note</strong>: TAHAMS does not use third-party analytics
          tools or tracking pixels. We keep your online activity private.
        </p>
      </>
    ),
  },
  {
    id: 'why-we-collect',
    title: '2. Why We Collect This Information',
    content: (
      <>
        <p className="mb-3">We gather your data to:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>
            <strong>Process Your Orders</strong>: Confirm purchases, process
            payments, and arrange delivery
          </li>
          <li>
            <strong>Arrange Delivery</strong>: Share your address with our
            courier partners to deliver your items safely
          </li>
          <li>
            <strong>Customer Support</strong>: Respond to your inquiries,
            address concerns, and provide assistance
          </li>
          <li>
            <strong>Improve Our Service</strong>: Understand which products
            and sizes are most popular, and enhance your shopping experience
          </li>
          <li>
            <strong>Prevent Fraud</strong>: Verify transactions and protect
            both you and TAHAMS
          </li>
          <li>
            <strong>Keep Records</strong>: Maintain accurate records for
            business and accounting purposes as required by law
          </li>
          <li>
            <strong>Contact You</strong>: Send order confirmations and
            shipping updates (transactional communications only)
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'how-we-share',
    title: '3. How We Share Your Information',
    content: (
      <>
        <p className="mb-3">
          <strong>We Do NOT Sell Your Data.</strong> We will never sell,
          rent, or trade your personal information to third parties.
        </p>

        <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          We ONLY Share Information With
        </h3>
        <p className="mb-2 font-medium text-gray-700">
          Service Partners (only the information they need):
        </p>
        <ul className="list-disc pl-6 space-y-1.5 mb-4">
          <li>
            <strong>Payment Gateways</strong> (bKash, Nagad, Rocket, card
            processors): Your payment details for transaction processing
          </li>
          <li>
            <strong>Courier &amp; Logistics Companies</strong>: Your name,
            phone number, and delivery address only
          </li>
          <li>
            <strong>Essential Service Providers</strong>: IT support for
            website maintenance (data handled confidentially)
          </li>
        </ul>

        <p className="mb-2 font-medium text-gray-700">Legal Situations:</p>
        <ul className="list-disc pl-6 space-y-1.5 mb-4">
          <li>Government agencies or law enforcement if legally required</li>
          <li>
            To protect TAHAMS&rsquo;s rights, your safety, or prevent fraud
          </li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          Our Partners Must
        </h3>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Use your data only for the specific purpose we provide it</li>
          <li>Keep your information confidential</li>
          <li>Never share it with anyone else</li>
          <li>Follow data protection practices</li>
        </ul>
      </>
    ),
  },
  {
    id: 'how-we-protect',
    title: '4. How We Protect Your Information',
    content: (
      <>
        <p className="mb-3">
          Your security matters to us. We protect your data through:
        </p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>
            <strong>Secure Payment Processing</strong>: All online payments
            use encrypted, secure connections (HTTPS)
          </li>
          <li>
            <strong>Limited Access</strong>: Only authorized TAHAMS team
            members can access your personal information
          </li>
          <li>
            <strong>Confidentiality</strong>: All staff handling customer
            data must maintain strict confidentiality
          </li>
          <li>
            <strong>Secure Storage</strong>: Your information is stored
            safely and not shared unnecessarily
          </li>
          <li>
            <strong>Regular Review</strong>: We regularly check our security
            practices
          </li>
        </ul>
        <p className="mt-3 text-sm bg-gray-50 border border-gray-200 rounded-lg p-3">
          <strong>Important</strong>: While we work hard to protect your
          information, no system is 100% secure. Use our services knowing
          that some risk always exists online.
        </p>
      </>
    ),
  },
  {
    id: 'your-rights',
    title: '5. Your Rights & Control Over Your Information',
    content: (
      <>
        <p className="mb-3">You have the right to:</p>
        <ul className="list-disc pl-6 space-y-1.5 mb-4">
          <li>
            <strong>Access</strong>: Ask us what personal information we have
            about you
          </li>
          <li>
            <strong>Correct</strong>: Update or fix any incorrect information
          </li>
          <li>
            <strong>Delete</strong>: Request removal of your personal data
            (except where law requires us to keep records)
          </li>
          <li>
            <strong>Understand</strong>: Know exactly how and why we use your
            information
          </li>
        </ul>
        <p>
          To exercise any of these rights, contact the TAHAMS Privacy Team
          using the details below. We will respond to your request within
          10-15 business days.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: '6. Cookies & Tracking',
    content: (
      <>
        <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          What Are Cookies?
        </h3>
        <p className="mb-3">
          Cookies are small files stored on your device to remember
          information about your visits.
        </p>

        <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          How TAHAMS Uses Cookies
        </h3>
        <ul className="list-disc pl-6 space-y-1.5 mb-3">
          <li>
            <strong>Essential Cookies</strong>: Required for basic website
            function (like shopping cart)
          </li>
          <li>
            <strong>Remember Your Preferences</strong>: To save your language
            choice or accessibility settings
          </li>
        </ul>
        <p className="mb-3">That&rsquo;s it&mdash;we keep it minimal and private.</p>

        <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          What We DON&rsquo;T Do
        </h3>
        <ul className="list-disc pl-6 space-y-1.5 mb-3">
          <li>We do not use Google Analytics or third-party tracking</li>
          <li>We do not use retargeting or advertising pixels</li>
          <li>We do not track you across other websites</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          Your Cookie Choices
        </h3>
        <p>
          You can disable cookies in your browser settings, though this may
          affect website functionality.
        </p>
      </>
    ),
  },
  {
    id: 'social-media',
    title: '7. Our Social Media Presence',
    content: (
      <>
        <p className="mb-3">
          TAHAMS is active on Instagram:{' '}
          <a
            href="https://www.instagram.com/tahams_bd/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            @tahams_bd
          </a>
        </p>
        <p className="mb-2">
          When you follow or interact with us on social media:
        </p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>
            Instagram&rsquo;s privacy policy applies to any data you share on
            their platform
          </li>
          <li>
            TAHAMS does not have access to your Instagram account information
          </li>
          <li>
            We only see public comments and messages you send us directly
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'childrens-privacy',
    title: "8. Children's Privacy",
    content: (
      <p>
        TAHAMS respects the privacy of young people. If you are under 18, we
        ask that a parent or guardian review this policy. We do not
        intentionally collect personal information from children under 13.
        If we discover we have, we will delete it immediately.
      </p>
    ),
  },
  {
    id: 'retention',
    title: '9. How Long We Keep Your Information',
    content: (
      <ul className="list-disc pl-6 space-y-1.5">
        <li>
          <strong>While You Shop With Us</strong>: We keep your information
          as long as you&rsquo;re an active customer
        </li>
        <li>
          <strong>After Your Last Purchase</strong>: We retain order records
          for 3-5 years for business and tax purposes (as required by law)
        </li>
        <li>
          <strong>If You Request Deletion</strong>: We delete your personal
          information upon request, except where law requires us to keep
          records
        </li>
        <li>
          <strong>Backup Copies</strong>: For security reasons, deleted data
          may remain in backups for up to 1 year
        </li>
      </ul>
    ),
  },
  {
    id: 'international',
    title: '10. International Data',
    content: (
      <p>
        TAHAMS operates in Bangladesh. Since we operate domestically only,
        your information stays within Bangladesh. If this changes in the
        future, we will update this policy.
      </p>
    ),
  },
  {
    id: 'communications',
    title: '11. Communications & Marketing',
    content: (
      <>
        <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          What You&rsquo;ll Receive
        </h3>
        <ul className="list-disc pl-6 space-y-1.5 mb-4">
          <li>
            <strong>Order Confirmations &amp; Updates</strong>: Messages
            confirming your purchase and tracking delivery
          </li>
          <li>
            <strong>Customer Support</strong>: Responses to your inquiries
            and concerns
          </li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          What You Won&rsquo;t Receive
        </h3>
        <ul className="list-disc pl-6 space-y-1.5 mb-4">
          <li>
            <strong>No Marketing Emails</strong>: We do not send promotional
            emails or newsletters
          </li>
          <li>
            <strong>No SMS Promotions</strong>: We do not send unsolicited
            text messages
          </li>
          <li>
            <strong>No Push Notifications</strong>: We do not send app
            notifications for sales or promotions
          </li>
        </ul>
        <p>
          Your choice remains respected. If you ever receive unwanted
          communications from TAHAMS, contact us immediately.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: '12. Changes to This Privacy Policy',
    content: (
      <>
        <p className="mb-3">
          We may update this policy as our business evolves. When we do:
        </p>
        <ul className="list-disc pl-6 space-y-1.5 mb-3">
          <li>We will post the updated policy on this page</li>
          <li>The &ldquo;Last Updated&rdquo; date will change</li>
          <li>Major changes will be communicated to you</li>
        </ul>
        <p>
          Your continued use of TAHAMS means you accept the updated policy.
        </p>
      </>
    ),
  },
];

const CONTACT_DETAILS = {
  email: 'tahamsbd@gmail.com',
  phone: '+8801602054102',
  address: '2, G/8, Maa House, Golden Street, Ring Road, Shyamoli, Dhaka-1207',
};

const CORE_PRINCIPLES = [
  { title: 'Transparency', desc: "We're honest about what we collect and why" },
  { title: 'Simplicity', desc: 'We keep it minimal—only necessary information' },
  { title: 'Security', desc: 'We protect your data seriously' },
  { title: 'Respect', desc: 'Your choices and privacy matter to us' },
  { title: 'Accountability', desc: 'We take responsibility for your information' },
];

const ContactCard = () => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-3">
    <h3 className="text-lg font-semibold text-gray-800 mb-2">
      TAHAMS Privacy Team
    </h3>
    <a
      href={`mailto:${CONTACT_DETAILS.email}`}
      className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors"
    >
      <Mail size={18} className="text-blue-500 shrink-0" />
      <span>{CONTACT_DETAILS.email}</span>
    </a>
    <a
      href={`tel:${CONTACT_DETAILS.phone}`}
      className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors"
    >
      <Phone size={18} className="text-green-500 shrink-0" />
      <span>{CONTACT_DETAILS.phone}</span>
    </a>
    <div className="flex items-start gap-3 text-gray-600">
      <MapPin size={18} className="text-red-500 shrink-0 mt-0.5" />
      <span>{CONTACT_DETAILS.address}</span>
    </div>
    <p className="text-sm text-gray-500 pt-2">
      Response Time: 10-15 business days
    </p>
  </div>
);

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white py-16 lg:pt-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 mt-40">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Privacy Policy
          </h1>
          <p className="text-gray-500">Last Updated: August 2026</p>
        </div>

        {/* Intro */}
        <div className="prose prose-gray max-w-none mb-10 text-gray-600 leading-relaxed">
          <p>
            At TAHAMS, we value the trust you place in us. We believe that
            transparency and respect for your personal information are
            fundamental to building lasting relationships with our
            community. This Privacy Policy outlines how we collect, use,
            protect, and respect your data.
          </p>
          <p>
            By interacting with TAHAMS&mdash;whether shopping in-store,
            purchasing online, or following us on social media&mdash;you
            agree to the terms outlined in this policy. We encourage you to
            read this carefully. If you have any questions, we&rsquo;re here
            to help.
          </p>
        </div>

        {/* Table of contents */}
        <nav
          aria-label="Table of contents"
          className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-12"
        >
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">
            On This Page
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {section.title}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#contact"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                13. Questions or Concerns?
              </a>
            </li>
          </ul>
        </nav>

        {/* Sections */}
        <div className="space-y-12">
          {SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                {section.title}
              </h2>
              <div className="text-gray-600 leading-relaxed">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        {/* Core principles */}
        <div className="mt-14 pt-10 border-t border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
            Our Core Privacy Principles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CORE_PRINCIPLES.map((principle) => (
              <div
                key={principle.title}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4"
              >
                <h3 className="font-semibold text-gray-800 mb-1">
                  {principle.title}
                </h3>
                <p className="text-sm text-gray-500">{principle.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact / questions */}
        <section id="contact" className="scroll-mt-24 mt-14 pt-10 border-t border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            13. Questions or Concerns?
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            If you have questions about this Privacy Policy or how TAHAMS
            handles your data, reach out to us below. If you believe your
            privacy has been violated, you can file a complaint with
            relevant data protection authorities in Bangladesh.
          </p>
          <ContactCard />
        </section>

        {/* Legal notice */}
        <p className="text-sm text-gray-500 mt-10 italic">
          This Privacy Policy is incorporated into TAHAMS&rsquo;s Terms of
          Service. By using TAHAMS&rsquo;s services, you agree to both
          documents.
        </p>

        {/* Back to home */}
        <div className="mt-12 text-center">
          <Link href="/" className="btn btn-outline capitalize gap-2">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
