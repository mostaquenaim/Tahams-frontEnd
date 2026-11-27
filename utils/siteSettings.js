import { SITE_DEFAULTS } from './siteDefaults';

// Public business details: saved on the admin "Site info" page first, the
// built-in copy (utils/siteDefaults.js) second.
//
// Each key is taken whole from one source, never field by field: if an admin
// cleared the WhatsApp number on purpose, the old one must not come back from
// the defaults. The backend checks every save, so here we only check the
// shape, in case an older or broken backend answers.

const isObject = (v) => !!v && typeof v === 'object' && !Array.isArray(v);

const SHAPES = {
  contact: (v) => isObject(v) && typeof v.phone === 'string' && typeof v.email === 'string',
  showrooms: (v) =>
    Array.isArray(v) && v.every((s) => isObject(s) && typeof s.id === 'string' && typeof s.name === 'string'),
  social: isObject,
  promoBanners: (v) => Array.isArray(v) && v.every((b) => isObject(b) && typeof b.text === 'string'),
};

export const SITE_SETTING_KEYS = Object.keys(SHAPES);

// -> { settings, fallbackKeys }. fallbackKeys lists the keys whose saved value
// was there but unusable (a missing key is normal: never saved).
export const mergeSiteSettings = (saved) => {
  const settings = {};
  const fallbackKeys = [];
  for (const key of SITE_SETTING_KEYS) {
    const value = isObject(saved) ? saved[key] : undefined;
    if (value === undefined || value === null) {
      settings[key] = SITE_DEFAULTS[key];
    } else if (SHAPES[key](value)) {
      settings[key] = value;
    } else {
      settings[key] = SITE_DEFAULTS[key];
      fallbackKeys.push(key);
    }
  }
  return { settings, fallbackKeys };
};

// --- display helpers ---------------------------------------------------

// '+8801347519967' -> '+88 01347519967'
export const phoneLabel = (phone) =>
  typeof phone === 'string' && phone.startsWith('+88') ? `+88 ${phone.slice(3)}` : phone || '';

// '+8801347519967' -> 'https://wa.me/8801347519967'
export const whatsappUrl = (phone) =>
  phone ? `https://wa.me/${String(phone).replace(/\D/g, '')}` : null;

// Addresses keep line breaks for the footer; one-line places join them.
export const oneLine = (text) => (text ? String(text).replace(/\s*\n\s*/g, ' ') : '');

export const activeBanners = (banners) =>
  (banners || [])
    .filter((b) => b.active !== false && b.text)
    .map((b, index) => ({ ...b, id: index + 1 }));

export const pickupCenters = (showrooms) =>
  (showrooms || []).filter((s) => s.pickup && s.pickupName);

// Social links in display order, without the empty ones.
export const SOCIAL_NETWORKS = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'messenger', label: 'Messenger' },
];
export const socialLinks = (social, keys = SOCIAL_NETWORKS.map((n) => n.key)) =>
  SOCIAL_NETWORKS.filter((n) => keys.includes(n.key) && social?.[n.key]).map((n) => ({
    ...n,
    href: social[n.key],
  }));
