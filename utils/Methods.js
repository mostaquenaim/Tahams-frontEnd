// Payment methods (numbers, instructions, icons) are NOT here: they come from
// the backend (Hooks/useCheckoutConfig.js -> usePaymentMethods) and are
// edited on the admin Payment methods page.

export const DeliveryMethods = () => {
  const deliveryData = [
        { id: 1, name: 'Pathao Courier', icon: '/delivery-methods/pathao-bnw.png',  },
        { id: 2, name: 'Sundarban Courier', icon: '/delivery-methods/sundarban-bnw.png'},
        { id: 3, name: 'SA Paribahan', icon: '/delivery-methods/sa-paribahan-bnw.png'},
    ];

  return deliveryData
}
