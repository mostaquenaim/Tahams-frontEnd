// Superseded: series are now renamed and re-imaged inline on the series list.
const UpdateCategoryRedirect = () => null;

export default UpdateCategoryRedirect;

export const getServerSideProps = () => ({
  redirect: { destination: '/admin/show/show-all-series', permanent: false },
});
