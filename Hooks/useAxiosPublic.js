import axios from "axios";

const axiosPublic = axios.create({
    baseURL: 'http://tahamsbd.com/api'
})

const useAxiosPublic = () => {
    return axiosPublic;
};

export default useAxiosPublic;