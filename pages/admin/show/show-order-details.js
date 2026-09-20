// Superseded: order details open from a row on the orders list.
const OrderDetailsRedirect = () => null;

export default OrderDetailsRedirect;

export const getServerSideProps = () => ({
  redirect: { destination: '/admin/show/show-orders', permanent: false },
});
