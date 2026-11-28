// Most of one item (one cart line) a customer can order at a time.
// Must match MAX_LINE_QUANTITY in the backend (src/Admin/stock.ts), which
// refuses more at add-to-cart, on the cart page +/- and at checkout.
export const MAX_LINE_QUANTITY = 10;
