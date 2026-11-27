// Delivery fee for an address, from the backend's fee table
// (GET /admin/checkout/delivery-fees). Mirrors expectedDeliveryFee() in the
// backend's src/Admin/delivery-fees.ts, which re-prices every order - keep the
// two in step. Returns null while the fee can't be known yet.
export const deliveryFeeFor = (config, { isPickup, region, city }) => {
  if (isPickup) return 0;
  if (!config || !region) return null;
  const { fees, dhakaAreas } = config;
  if (region !== 'Dhaka') return fees.other;
  if (!city) return null;
  if (dhakaAreas.dhakaCity.includes(city)) return fees.dhakaCity;
  if (dhakaAreas.outsideDhaka.includes(city)) return fees.outsideDhaka;
  return fees.aroundDhaka;
};
