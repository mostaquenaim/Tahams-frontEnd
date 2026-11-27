// Built-in copy of the public business details, used for any setting that
// isn't saved on the admin "Site info" page yet, or when the backend can't be
// reached (see utils/siteSettings.js). Same shape as the backend stores
// (src/Admin/site-settings/site-settings-rules.ts in the backend).
//
// This is the ONLY place these are written in the storefront. Change them on
// the admin page; edit here only to change what a fresh install shows.
//
// Payment numbers and delivery fees are deliberately not here: a stale copy
// of those would send money to the wrong account or show the wrong price.

export const SITE_DEFAULTS = {
  contact: {
    phone: '+8801347519967',
    whatsapp: '+8801347519967',
    email: 'tahamsbd@gmail.com',
    supportHours: 'Sat–Thu, 10 AM – 6 PM',
    headOfficeAddress:
      '2nd Floor, 2-G/8, Maa House,\nGolden Street, Ring Road,\nShyamoli, Dhaka-1207',
    headOfficeMapUrl: 'https://maps.app.goo.gl/w6CFtf6APKZ5FF8S6',
  },

  // In display order. `pickupName` is what a pickup order records, so keep
  // the old names as long as staff search orders by them.
  showrooms: [
    {
      id: 'dc1',
      name: 'Display Center 1',
      pickupName: 'DC1 - Shahabuddin Plaza',
      address: 'Shop No. 36-37, Ground Floor,\nShahabuddin Plaza, Ring Road, Dhaka-1207',
      phone: '+8801314188605',
      mapUrl: 'https://maps.app.goo.gl/89rVTtxgdV5G1E3j9',
      pickup: true,
    },
    {
      id: 'dc2',
      name: 'Display Center 2',
      pickupName: 'DC2 - Bashundhara City',
      address: 'Shop No. 1, Block A, Level 5,\nBashundhara City, Panthapath, Dhaka-1215',
      phone: '+8801332136066',
      mapUrl: 'https://maps.app.goo.gl/s2EwSNcKPKkCPv919',
      pickup: true,
    },
    {
      id: 'dc3',
      name: 'Display Center 3',
      pickupName: 'DC3 - Lalbagh',
      address: '23/4-C, Shaista Khan Road,\nLalbagh, Dhaka-1211',
      phone: '+8801349019745',
      mapUrl: 'https://maps.app.goo.gl/PqekBmQzVfLRTYBK8',
      pickup: true,
    },
    {
      id: 'dc4',
      name: 'Display Center 4',
      pickupName: 'DC4 - Mirpur 1',
      address:
        'Shop No. 45, Ground Floor, Al-Nahiyan Shopping Complex,\nKFC Goli, Beside Sony Square, Mirpur 1, Dhaka-1216',
      phone: '+8801347519960',
      mapUrl: 'https://maps.app.goo.gl/y91oWQHtynygeVRA8',
      pickup: true,
    },
  ],

  social: {
    facebook: 'https://www.facebook.com/tahamsbd/',
    instagram: 'https://www.instagram.com/tahams_bd/',
    tiktok: 'https://www.tiktok.com/@tahams_bd',
    messenger: 'https://m.me/111664024670524',
  },

  // The rotating notice above the navbar.
  promoBanners: [
    {
      text: 'Advance bKash 150 BDT on Outside Dhaka Orders. (bKash merchant payment - 01314188605)',
      bgColor: '#ffffff',
      textColor: '#000000',
      active: true,
      links: [],
    },
    {
      text: 'Order easily',
      bgColor: '#ffffff',
      textColor: '#000000',
      active: true,
      links: [
        { text: 'Call Now', url: 'tel:+8801314188605' },
        { text: 'Facebook', url: 'https://www.facebook.com/tahamsbd' },
        { text: 'Instagram', url: 'https://www.instagram.com/tahams_bd' },
        { text: 'Messenger', url: 'https://m.me/111664024670524' },
      ],
    },
  ],
};
