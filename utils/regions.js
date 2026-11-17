// Server-side fetch of Bangladesh delivery regions from the external location
// API (NEXT_PUBLIC_LOCATION). Used by getStaticProps on /buy-now and the admin
// orders page. Throws on timeout, HTTP error or an unexpected/empty response
// so callers can decide whether to keep a cached page or fall back.
import { API_TIMEOUT_MS } from './staticFetch';

export async function fetchRegionsData() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_LOCATION}?countryCode=BD`,
      { signal: controller.signal },
    );
    if (!res.ok) throw new Error(`Regions API responded ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data?.module) || data.module.length === 0) {
      throw new Error('Regions API returned no regions');
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

// Just { id, name } per region, as /buy-now expects.
export async function fetchRegions() {
  const data = await fetchRegionsData();
  return data.module.map(({ id, name }) => ({ id, name }));
}
