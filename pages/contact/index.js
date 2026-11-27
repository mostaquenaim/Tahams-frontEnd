import ContactForm from '/components/Forms/ContactForm';
import Head from 'next/head';
import React from 'react';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import {
  PageShell,
  PageHeader,
  Card,
} from '../../components/Storefront/StorefrontUI';
import useSiteSettings from '../../Hooks/useSiteSettings';
import { oneLine, phoneLabel, socialLinks } from '../../utils/siteSettings';

const SOCIAL_ICONS = { facebook: FaFacebook, instagram: FaInstagram, tiktok: FaTiktok };

const Contact = () => {
  const { contact, showrooms, social } = useSiteSettings();
  const places = [
    {
      id: 'head-office',
      name: 'Head office',
      address: contact.headOfficeAddress,
      phone: contact.phone,
      mapUrl: contact.headOfficeMapUrl,
    },
    ...showrooms,
  ];
  const socials = socialLinks(social, Object.keys(SOCIAL_ICONS)).map((link) => ({
    ...link,
    icon: SOCIAL_ICONS[link.key],
  }));

  return (
    <>
      <Head>
        <title>Contact - Tahams</title>
      </Head>
      <PageShell tone="muted">
        <div className="mx-auto max-w-6xl">
          <PageHeader
            eyebrow="Contact"
            title="Get in touch"
            subtitle="Questions about an order, a size, or anything else? Send us a message or reach us directly - we'd love to hear from you."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <ContactForm />

            <Card className="space-y-6 sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-start gap-3 rounded-xl border border-gray-100 p-4 transition hover:border-gray-300"
                >
                  <FiPhone className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
                  <span>
                    <span className="block text-sm font-semibold text-gray-900">
                      Phone
                    </span>
                    <span className="text-sm text-gray-600">
                      {phoneLabel(contact.phone)}
                    </span>
                    {contact.whatsapp && (
                      <span className="block text-xs text-green-600">
                        {contact.whatsapp === contact.phone
                          ? 'WhatsApp also available'
                          : `WhatsApp: ${phoneLabel(contact.whatsapp)}`}
                      </span>
                    )}
                    {contact.supportHours && (
                      <span className="block text-xs text-gray-500">
                        {contact.supportHours}
                      </span>
                    )}
                  </span>
                </a>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-start gap-3 rounded-xl border border-gray-100 p-4 transition hover:border-gray-300"
                >
                  <FiMail className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-gray-900">
                      Email
                    </span>
                    <span className="break-words text-sm text-gray-600">
                      {contact.email}
                    </span>
                  </span>
                </a>
              </div>

              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <FiMapPin className="h-4 w-4 text-gray-500" />
                  Find us
                </h2>
                <ul className="mt-3 divide-y divide-gray-100 text-sm">
                  {places.map((place) => (
                    <li key={place.id} className="py-2.5">
                      <p className="font-medium text-gray-900">{place.name}</p>
                      <p className="text-gray-600">{oneLine(place.address)}</p>
                      <p className="mt-1 flex flex-wrap gap-x-4 text-xs">
                        {place.phone && (
                          <a
                            href={`tel:${place.phone}`}
                            className="text-gray-700 underline-offset-2 hover:underline"
                          >
                            {place.phone}
                          </a>
                        )}
                        {place.mapUrl && (
                          <a
                            href={place.mapUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-gray-700 underline-offset-2 hover:underline"
                          >
                            View on map
                          </a>
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              {socials.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Follow us
                </h2>
                <div className="mt-3 flex gap-3">
                  {socials.map(({ label, href, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-black hover:text-black"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
              )}
            </Card>
          </div>
        </div>
      </PageShell>
    </>
  );
};

export default Contact;
