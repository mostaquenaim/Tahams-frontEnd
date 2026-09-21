// Cart/checkout pricing. Mirrors the backend (AdminService.createNewCartObject):
// each line is ceil((price - discount + vat) * quantity), so what customers
// see here is exactly what they are charged.

export const unitPrice = (product) => {
  const base = Number(product?.sellingPrice) || 0;
  const discount = (base * (Number(product?.discountPercentage) || 0)) / 100;
  const vat = (base * (Number(product?.vatPercentage) || 0)) / 100;
  return base - discount + vat;
};

export const lineTotal = (item) =>
  Math.ceil(unitPrice(item?.product) * (Number(item?.Quantity) || 0));

export const cartSubtotal = (items) =>
  (items || []).reduce((sum, item) => sum + lineTotal(item), 0);

export const formatBDT = (amount) => `৳${Number(amount || 0).toLocaleString()}`;
