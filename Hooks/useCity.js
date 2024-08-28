
const useCity = ({data}) => {
    return data
};

export default useCity;

export async function getServerSideProps() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_LOCATION}?countryCode=BD`);
    const data = await res.json();
  
    return {
      props: {
        data,
      },
    };
  }