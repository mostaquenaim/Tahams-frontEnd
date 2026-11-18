// Helpers for getStaticProps (ISR) data fetching.
//
// The rule for ISR pages: if the API fails while Next is regenerating a page
// in the background, THROW. Next then keeps serving the last good copy and
// retries on a later request. Returning empty props instead would cache a
// broken page for the whole revalidate window.
//
// The exception is `next build`: there is no "last good copy" yet, and a
// thrown error would fail the build. During the build we fall back to empty
// data with a short revalidate so the page heals itself right after deploy.
import axios from 'axios';

export const API_TIMEOUT_MS = 5000;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API,
  timeout: API_TIMEOUT_MS,
});

// GET from the backend API. Throws on network error, timeout or non-2xx.
export async function apiGet(path) {
  const res = await api.get(path);
  return res.data;
}

export function isBuildPhase() {
  return process.env.NEXT_PHASE === 'phase-production-build';
}
