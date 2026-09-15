// Courier slugs that mean the order failed/was cancelled — checked
// case-insensitively so "Cancelled", "cancelled", "Pickup_Cancelled" etc.
// all resolve the same way instead of only one exact string matching.
export const FAILED_COURIER_SLUGS = [
  'cancelled',
  'pickup_cancelled',
  'returned',
  'return',
];

// The backend overwrites deliveryStatus.name with the courier's status when
// courier info exists but leaves deliveryStatus.id alone, so badge text and
// tone must come from the same source: the courier's status once the order
// has been handed over, the internal delivery status before that.
// `tone` is one of the admin <Badge> tones.
export const getOrderStatus = (history) => {
  const slug = history?.courierInfo?.order_status_slug?.toLowerCase();

  let tone;
  if (slug) {
    if (FAILED_COURIER_SLUGS.includes(slug)) tone = 'danger';
    else if (slug === 'delivered') tone = 'success';
    else tone = 'info';
  } else {
    const statusId = history?.deliveryStatus?.id;
    if (statusId > 6) tone = 'danger';
    else if (statusId === 6) tone = 'success';
    else tone = 'warning';
  }

  const label = history?.courierInfo
    ? history.courierInfo.order_status
    : history?.deliveryStatus?.name || 'Unknown';

  return { label, tone };
};
