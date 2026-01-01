export const pushToDataLayer = (eventName, ecommerceData, user_email) => {
  window.dataLayer = window.dataLayer || [];

  const ecommercePayload = {
    ...ecommerceData,
  };

  if (user_email) {
    // Append `user_email` to each item (if items exist)
    if (Array.isArray(ecommercePayload.items)) {
      ecommercePayload.items = ecommercePayload.items.map((item) => ({
        ...item,
        user_email,
      }));
    } else {
      // Or add it at the root if no items array
      ecommercePayload.user_email = user_email;
    }
  }

  window.dataLayer.push({
    event: eventName,
    ecommerce: ecommercePayload,
  });
};

// push items into an array
export const generateTempItems = (selectedItems) =>
  selectedItems.map((item) => ({
    item_id: item.product.id,
    item_name: item.product.name,
    item_color: item.ProductName?.split(' ')[0] || 'Unknown',
    item_series: item.category?.category?.category?.name || 'N/A',
    main_category: item.category?.category?.name || 'N/A',
    sub_category: item.category?.name || 'N/A',
    item_price: Number(
      (
        item.product.sellingPrice -
        (item.product.sellingPrice * item.product.discountPercentage) / 100 +
        (item.product.sellingPrice * item.product.vatPercentage) / 100
      ).toFixed(0),
    ),
    quantity: Number(item.Quantity) || 1,
    total_views: item.product.totalViews || 0,
    selected_size: item.size || null,
    selected_maleSize: item.maleSize || null,
    selected_femaleSize: item.femaleSize || null,
    discount_percent: item.product.discountPercentage || 0,
  }));

// discounted vat price
export const discountedPrice = (items) =>
  items.reduce((acc, item) => {
    const basePrice = item.product.sellingPrice;
    const discount = (basePrice * item.product.discountPercentage) / 100;
    const vat = (basePrice * item.product.vatPercentage) / 100;
    const finalPrice = (basePrice - discount + vat) * item.Quantity;
    return acc + parseInt(finalPrice);
  }, 0);
