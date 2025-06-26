
export const PaymentMethods = () => {
    const paymentData = [
        { id: 1, name: 'Cash on Delivery', icon: '/cod.png', process: 'Payment upon delivery' },
        { id: 2, name: 'BKash', icon: '/bkash-bnw.png', process: 'Merchant Number: 01314188605 (PAYMENT)\nReference: Your name and amount you pay' },
        { id: 3, name: 'Nagad', icon: '/nagad-bnw.png', process: 'Merchant Number: 01602054102 (PAYMENT)\nReference: Your name and amount you pay' },
        { id: 4, name: 'Rocket', icon: '/rocket-bnw.png', process: 'Number: 01602054102 (Send Money)\nReference: Your name and amount you pay' },
        // { id: 5, name: 'Visa Card', icon: '/visa.png', process: 'Please proceed with your Visa Card details.\n\nBank Name: The City Bank Ltd.\nBranch Name: Shyamoli\nA/C NAME: TAHAMS\nA/C NUMBER: 1233871270001' },
        { id: 6, name: 'Bank Transfer', icon: '/bank-transfer.jpg', process: 'Please proceed with your Bank details.\n\nBank Name: The City Bank Ltd.\nBranch Name: Shyamoli\nA/C NAME: TAHAMS\nA/C NUMBER: 1233871270001' },
        // { id: 7, name: 'Amex Card', icon: '/amex.png', process: 'Please proceed with your AMEX Card details.\n\nBank Name: The City Bank Ltd.\nBranch Name: Shyamoli\nA/C NAME: TAHAMS\nA/C NUMBER: 1233871270001' },
        { id: 8, name: 'Pick-Up Point', icon: '/cop-bnw.png', process: 'Pay when you pick up your item.' },
    ];

  return paymentData
};

export const DeliveryMethods = () => {
  const deliveryData = [
        { id: 1, name: 'Pathao Courier', icon: '/delivery-methods/pathao-bnw.png',  },
        { id: 2, name: 'Sundarban Courier', icon: '/delivery-methods/sundarban-bnw.png'},
        { id: 3, name: 'SA Paribahan', icon: '/delivery-methods/sa-paribahan-bnw.png'},
    ];

  return deliveryData
}
