import ContactForm from '/components/Forms/ContactForm';
import Head from 'next/head';
import React from 'react';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import {
  PageShell,
  PageHeader,
  Card,
  CONTACT,
} from '../../components/Storefront/StorefrontUI';

const SHOWROOMS = [
  {
    label: 'Head office',
    address: '2nd Floor, 2-G/8, Maa House, Golden Street, Ring Rd, Dhaka 1207',
  },
  {
    label: 'Display Center 1',
    address: '35-36, 2nd Floor, Shahabuddin Plaza, Ring Road, Dhaka 1207',
  },
  {
    label: 'Display Center 2',
    address:
      'Shop No: 1, Block: A, Level: 5, Bashundhara City Shopping Complex',
  },
  {
    label: 'Display Center 3',
    address: '23, 4-C Shaista Khan Rd, Lalbagh, Dhaka',
  },
];

const SOCIALS = [
  { label: 'Facebook', href: CONTACT.facebook, icon: FaFacebook },
  { label: 'Instagram', href: CONTACT.instagram, icon: FaInstagram },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@tahams_bd',
    icon: FaTiktok,
  },
];

const Contact = () => {
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
                  href={`tel:${CONTACT.phone}`}
                  className="flex items-start gap-3 rounded-xl border border-gray-100 p-4 transition hover:border-gray-300"
                >
                  <FiPhone className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
                  <span>
                    <span className="block text-sm font-semibold text-gray-900">
                      Phone
                    </span>
                    <span className="text-sm text-gray-600">
                      {CONTACT.phoneLabel}
                    </span>
                  </span>
                </a>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-start gap-3 rounded-xl border border-gray-100 p-4 transition hover:border-gray-300"
                >
                  <FiMail className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-gray-900">
                      Email
                    </span>
                    <span className="break-words text-sm text-gray-600">
                      {CONTACT.email}
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
                  {SHOWROOMS.map((place) => (
                    <li key={place.label} className="py-2.5">
                      <p className="font-medium text-gray-900">{place.label}</p>
                      <p className="text-gray-600">{place.address}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Follow us
                </h2>
                <div className="mt-3 flex gap-3">
                  {SOCIALS.map(({ label, href, icon: Icon }) => (
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
            </Card>
          </div>
        </div>
      </PageShell>
    </>
  );
};

export default Contact;
