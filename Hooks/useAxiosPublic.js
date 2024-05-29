import axios from "axios";

const axiosPublic = axios.create({
    baseURL: 'http://api.tahamsbd.com'
})

const useAxiosPublic = () => {
    return axiosPublic;
};

export default useAxiosPublic;