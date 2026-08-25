import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from './useAxiosPublic';

const useSearch = (searchQuery, initialData) => {
  const axiosPublic = useAxiosPublic();

  const fetchSearchData = async () => {
    const res = await axiosPublic.get(
      `/admin/search-products?q=${searchQuery}`
    );
    return res.data;
  };

  const {
    data: searchedItems = [],
    isPending,
    isFetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ['searchedItems', searchQuery],
    queryFn: fetchSearchData,
    enabled: !!searchQuery, // only run when query exists
    staleTime: 30 * 1000,   // optional but smart
    ...(initialData ? { initialData } : {}),
  });

  return {
    searchedItems,
    isPending,
    isFetching,
    error,
    refetch,
  };
};

export default useSearch;
