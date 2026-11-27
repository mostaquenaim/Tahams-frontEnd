import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from './useAxiosPublic';
import { mergeSiteSettings } from '../utils/siteSettings';

export const SITE_SETTINGS_KEY = ['siteSettings'];

// Logged once per page load, not on every component that reads settings.
let warned = false;
const warnOnce = (message, detail) => {
  if (warned) return;
  warned = true;
  // eslint-disable-next-line no-console
  console.warn(`[site settings] ${message} Showing the built-in details (utils/siteDefaults.js).`, detail ?? '');
};

// Contact info, showrooms, social links and promo banners.
// Always returns a full object: until the backend answers (and on the
// server render) it is the built-in copy, so pages never show blanks and
// server and client render the same thing first.
//
// const { contact, showrooms, social, promoBanners } = useSiteSettings();
const useSiteSettings = () => {
  const axiosPublic = useAxiosPublic();
  const { data, isError, error } = useQuery({
    queryKey: SITE_SETTINGS_KEY,
    queryFn: async () => (await axiosPublic.get('/admin/site-settings')).data,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const { settings, fallbackKeys } = useMemo(() => mergeSiteSettings(data), [data]);

  useEffect(() => {
    if (isError) warnOnce('Could not load site settings.', error?.message);
    else if (fallbackKeys.length) warnOnce(`Unusable saved value for: ${fallbackKeys.join(', ')}.`);
  }, [isError, error, fallbackKeys]);

  return settings;
};

export default useSiteSettings;
