import { useEffect, useState } from "react";

const useCity = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_LOCATION}?countryCode=BD`
        );
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  return { data, loading, error };
};

export default useCity;
