// Random data for the development-only "Fill with random data" buttons on the
// admin add pages. Nothing here is used in production: the buttons render only
// when NODE_ENV === 'development' (Next inlines that, so they are stripped
// from production builds).

export const IS_DEV = process.env.NODE_ENV === 'development';

export const randInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const pick = (items) => items[randInt(0, items.length - 1)];

const ADJECTIVES = [
  'Classic', 'Urban', 'Vintage', 'Bold', 'Soft', 'Golden', 'Midnight', 'Royal',
  'Breezy', 'Cozy', 'Rustic', 'Crisp', 'Velvet', 'Sunny', 'Slim', 'Relaxed',
];

const NOUNS = [
  'Tee', 'Hoodie', 'Panjabi', 'Polo', 'Jacket', 'Shirt', 'Sweater', 'Kurta',
  'Cap', 'Scarf', 'Trouser', 'Vest',
];

const SENTENCES = [
  'Made from breathable, everyday-comfortable fabric.',
  'A relaxed fit that works for any occasion.',
  'Designed in Dhaka with attention to every stitch.',
  'Soft on the skin and built to last through many washes.',
  'Pairs easily with jeans, chinos or your favourite joggers.',
  'A limited run, so grab yours while it lasts.',
];

// e.g. "Velvet Hoodie 482". The number keeps repeated fills from colliding with
// existing records that have unique names.
export const randomLabel = (nouns = NOUNS) =>
  `${pick(ADJECTIVES)} ${pick(nouns)} ${randInt(100, 999)}`;

export const randomSentences = (count = 2) =>
  Array.from({ length: count }, () => pick(SENTENCES)).join(' ');

export const randomHex = () =>
  `#${randInt(0, 0xffffff).toString(16).padStart(6, '0')}`;

// Local "YYYY-MM-DDTHH:mm" string, the value format of <input type="datetime-local">.
export const toDateTimeLocal = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// A small generated PNG so forms that require an image can be submitted
// without hunting for a file. Resolves to a File.
export const randomImageFile = (label = 'Random') =>
  new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    const hue = randInt(0, 359);
    const gradient = ctx.createLinearGradient(0, 0, 600, 800);
    gradient.addColorStop(0, `hsl(${hue}, 70%, 60%)`);
    gradient.addColorStop(1, `hsl(${(hue + 60) % 360}, 70%, 35%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 800);

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(label).slice(0, 24), 300, 410);

    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Could not generate an image'));
        return;
      }
      resolve(
        new File([blob], `dev-random-${Date.now()}-${randInt(0, 999)}.png`, {
          type: 'image/png',
        }),
      );
    }, 'image/png');
  });
