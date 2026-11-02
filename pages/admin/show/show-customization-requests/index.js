// Superseded: customization requests are a tab on the orders page.
const ShowCustomizationRequestsRedirect = () => null;

export default ShowCustomizationRequestsRedirect;

export const getServerSideProps = () => ({
  redirect: {
    destination: '/admin/show/show-orders?tab=custom',
    permanent: false,
  },
});
