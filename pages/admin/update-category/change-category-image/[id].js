// Superseded: series images are now changed inline on the series list.
const ChangeCategoryImageRedirect = () => null;

export default ChangeCategoryImageRedirect;

export const getServerSideProps = () => ({
  redirect: { destination: '/admin/show/show-all-series', permanent: false },
});
